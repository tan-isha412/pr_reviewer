import { test } from "node:test";
import assert from "node:assert/strict";
import attachComments from "../../src/parser/attachComments.js";

test("attachComments matches comments to chunks by file path", () => {
    const chunks = [
        { file: "a.js", diff: "diff a" },
        { file: "b.js", diff: "diff b" },
    ];
    const comments = [
        { path: "a.js", body: "nit: fix this" },
        { path: "c.js", body: "unrelated file" },
    ];

    const result = attachComments(chunks, comments);

    assert.equal(result[0].comments.length, 1);
    assert.equal(result[0].comments[0].body, "nit: fix this");
    assert.equal(result[0].hasComments, true);

    assert.equal(result[1].comments.length, 0);
    assert.equal(result[1].hasComments, false);
});

test("attachComments preserves original chunk fields", () => {
    const chunks = [{ file: "a.js", diff: "diff a" }];
    const result = attachComments(chunks, []);
    assert.equal(result[0].file, "a.js");
    assert.equal(result[0].diff, "diff a");
});

test("attachComments handles multiple comments on the same file", () => {
    const chunks = [{ file: "a.js", diff: "diff a" }];
    const comments = [
        { path: "a.js", body: "first" },
        { path: "a.js", body: "second" },
    ];
    const result = attachComments(chunks, comments);
    assert.equal(result[0].comments.length, 2);
});
