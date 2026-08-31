import { test } from "node:test";
import assert from "node:assert/strict";
import buildChunks from "../../src/builder/buildChunks.js";

test("buildChunks merges PR-level metadata onto each chunk", () => {
    const pr = { pr_number: 42, title: "Fix bug", author: "alice", merged_at: "2024-01-01T00:00:00Z" };
    const chunks = [
        { file: "a.js", diff: "diff a", comments: [], hasComments: false },
        { file: "b.js", diff: "diff b", comments: [{ body: "nit" }], hasComments: true },
    ];

    const result = buildChunks(pr, chunks);

    assert.equal(result.length, 2);
    for (const entry of result) {
        assert.equal(entry.prNumber, 42);
        assert.equal(entry.title, "Fix bug");
        assert.equal(entry.author, "alice");
        assert.equal(entry.mergedAt, "2024-01-01T00:00:00Z");
    }
    assert.equal(result[0].file, "a.js");
    assert.equal(result[1].file, "b.js");
    assert.equal(result[1].hasComments, true);
});

test("buildChunks falls back to pr.number and pr.mergedAt when pr_number/merged_at are absent", () => {
    const pr = { number: 7, title: "T", author: "bob", mergedAt: "2024-02-02T00:00:00Z" };
    const chunks = [{ file: "a.js", diff: "d", comments: [], hasComments: false }];

    const result = buildChunks(pr, chunks);

    assert.equal(result[0].prNumber, 7);
    assert.equal(result[0].mergedAt, "2024-02-02T00:00:00Z");
});
