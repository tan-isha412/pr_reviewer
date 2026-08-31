import { test, mock } from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";

const repoRoot = "/home/user/pr_reviewer";
const url = (rel) => new URL(rel, `file://${repoRoot}/`).href;

delete process.env.GEMINI_API_KEY; // keep dedupeFindings network-free

const askLLMResponses = new Map();
mock.module(url("src/reasoner/askLLM.js"), {
    defaultExport: async (prompt) => {
        const m = prompt.match(/File: (\S+)/);
        const file = m[1];
        return askLLMResponses.get(file);
    },
});

test("runReasoner keeps a well-formed, high-severity finding and persists it per PR/commit", async () => {
    const { default: runReasoner } = await import(url("src/reasoner/runReasoner.js"));

    askLLMResponses.set(
        "good.js",
        JSON.stringify({
            deviates: true,
            severity: "high",
            explanation: "Deviates from the established retry pattern.",
            citedPr: 5,
            file: "good.js",
            line: 10,
        })
    );

    const retrievedMatches = [
        {
            newChunk: { file: "good.js", diff: "diff" },
            matches: [{ similarityScore: 0.9, prNumber: 5, title: "t", diff: "d", comments: [] }],
        },
    ];

    const findingsDir = path.join(repoRoot, "data/processed/findings");
    await fs.rm(findingsDir, { recursive: true, force: true });

    const findings = await runReasoner(retrievedMatches, { repo: "pr_reviewer", prNumber: 11, commitId: "sha1" });

    assert.equal(findings.length, 1);
    assert.equal(findings[0].file, "good.js");

    const savedPath = path.join(findingsDir, "pr_reviewer-pr11-sha1.json");
    const saved = JSON.parse(await fs.readFile(savedPath, "utf8"));
    assert.equal(saved[0].file, "good.js");

    await fs.rm(findingsDir, { recursive: true, force: true });
});

test("runReasoner drops matches below the similarity threshold without calling askLLM", async () => {
    const { default: runReasoner } = await import(url("src/reasoner/runReasoner.js"));

    const retrievedMatches = [
        {
            newChunk: { file: "low-similarity.js", diff: "diff" },
            matches: [{ similarityScore: 0.1, prNumber: 1, title: "t", diff: "d", comments: [] }],
        },
    ];

    const findings = await runReasoner(retrievedMatches, { repo: "pr_reviewer", prNumber: 12, commitId: "sha2" });
    assert.deepEqual(findings, []);
});

test("runReasoner discards a malformed (non-JSON) LLM response via parseResponse", async () => {
    const { default: runReasoner } = await import(url("src/reasoner/runReasoner.js"));

    askLLMResponses.set("malformed.js", "this is not JSON at all");

    const retrievedMatches = [
        {
            newChunk: { file: "malformed.js", diff: "diff" },
            matches: [{ similarityScore: 0.9, prNumber: 5, title: "t", diff: "d", comments: [] }],
        },
    ];

    const findings = await runReasoner(retrievedMatches, { repo: "pr_reviewer", prNumber: 13, commitId: "sha3" });
    assert.deepEqual(findings, []);
});

test("runReasoner filters out a well-formed but low-severity finding", async () => {
    const { default: runReasoner } = await import(url("src/reasoner/runReasoner.js"));

    askLLMResponses.set(
        "low-severity.js",
        JSON.stringify({
            deviates: true,
            severity: "low",
            explanation: "Minor style nit.",
            citedPr: 5,
            file: "low-severity.js",
            line: 3,
        })
    );

    const retrievedMatches = [
        {
            newChunk: { file: "low-severity.js", diff: "diff" },
            matches: [{ similarityScore: 0.9, prNumber: 5, title: "t", diff: "d", comments: [] }],
        },
    ];

    const findings = await runReasoner(retrievedMatches, { repo: "pr_reviewer", prNumber: 14, commitId: "sha4" });
    assert.deepEqual(findings, []);
});
