import { test, mock } from "node:test";
import assert from "node:assert/strict";

const repoRoot = "/home/user/pr_reviewer";
const url = (rel) => new URL(rel, `file://${repoRoot}/`).href;

const calls = [];
const FAKE_RESULTS = [{ newChunk: { file: "a.js" }, matches: [] }];
const FAKE_FINDINGS = [{ file: "a.js", severity: "high" }];

let retrieveMatchesShouldThrow = false;

mock.module(url("src/retriever/retrieveMatches.js"), {
    defaultExport: async (owner, repo, prNumber, dim, k) => {
        calls.push({ fn: "retrieveMatches", args: [owner, repo, prNumber, dim, k] });
        if (retrieveMatchesShouldThrow) throw new Error("boom");
        return FAKE_RESULTS;
    },
});

mock.module(url("src/reasoner/runReasoner.js"), {
    defaultExport: async (results, context) => {
        calls.push({ fn: "runReasoner", args: [results, context] });
        return FAKE_FINDINGS;
    },
});

mock.module(url("src/delivery/runDeliver.js"), {
    defaultExport: async (findings, owner, repo, prNumber, commitId) => {
        calls.push({ fn: "runDeliver", args: [findings, owner, repo, prNumber, commitId] });
        return [];
    },
});

function fixturePayload(action) {
    return {
        action,
        repository: { owner: { login: "acme" }, name: "widgets" },
        pull_request: { number: 55, head: { sha: "abc123" } },
    };
}

function fakeRes() {
    const res = { statusCalls: [] };
    res.sendStatus = (code) => {
        res.statusCalls.push(code);
        return res;
    };
    return res;
}

test("handleWebhook calls retrieveMatches -> runReasoner -> runDeliver in order for an 'opened' PR", async () => {
    calls.length = 0;
    retrieveMatchesShouldThrow = false;
    const { default: handleWebhook } = await import(url("src/services/handleWebhook.js"));

    const req = { body: fixturePayload("opened") };
    const res = fakeRes();

    await handleWebhook(req, res);

    assert.deepEqual(calls.map((c) => c.fn), ["retrieveMatches", "runReasoner", "runDeliver"]);
    assert.deepEqual(calls[0].args, ["acme", "widgets", 55, 768, 5]);
    assert.equal(calls[1].args[0], FAKE_RESULTS);
    assert.deepEqual(calls[1].args[1], { repo: "widgets", prNumber: 55, commitId: "abc123" });
    assert.deepEqual(calls[2].args, [FAKE_FINDINGS, "acme", "widgets", 55, "abc123"]);
    assert.deepEqual(res.statusCalls, [200]);
});

test("handleWebhook short-circuits with 200 and calls nothing for an unhandled action", async () => {
    calls.length = 0;
    const { default: handleWebhook } = await import(url("src/services/handleWebhook.js"));

    const req = { body: fixturePayload("closed") };
    const res = fakeRes();

    await handleWebhook(req, res);

    assert.deepEqual(calls, []);
    assert.deepEqual(res.statusCalls, [200]);
});

test("handleWebhook responds 500 and skips downstream calls when retrieveMatches throws", async () => {
    calls.length = 0;
    retrieveMatchesShouldThrow = true;
    const { default: handleWebhook } = await import(url("src/services/handleWebhook.js"));

    const req = { body: fixturePayload("synchronize") };
    const res = fakeRes();

    await handleWebhook(req, res);

    assert.deepEqual(calls.map((c) => c.fn), ["retrieveMatches"]);
    assert.deepEqual(res.statusCalls, [500]);

    retrieveMatchesShouldThrow = false;
});
