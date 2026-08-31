import { test } from "node:test";
import assert from "node:assert/strict";
import parseDiff from "../../src/parser/parseDiff.js";

const TWO_FILE_DIFF = `diff --git a/src/foo.js b/src/foo.js
index 1111111..2222222 100644
--- a/src/foo.js
+++ b/src/foo.js
@@ -1,2 +1,2 @@
-old line
+new line
diff --git a/src/bar.js b/src/bar.js
index 3333333..4444444 100644
--- a/src/bar.js
+++ b/src/bar.js
@@ -1 +1 @@
-a
+b
`;

test("parseDiff splits a multi-file diff into one chunk per file", () => {
    const chunks = parseDiff(TWO_FILE_DIFF);
    assert.equal(chunks.length, 2);
    assert.equal(chunks[0].file, "src/foo.js");
    assert.equal(chunks[1].file, "src/bar.js");
});

test("parseDiff keeps the diff body for each file, excluding the file header line", () => {
    const chunks = parseDiff(TWO_FILE_DIFF);
    assert.ok(chunks[0].diff.includes("-old line"));
    assert.ok(chunks[0].diff.includes("+new line"));
    assert.ok(!chunks[0].diff.includes("src/bar.js"));
});

test("parseDiff returns an empty array for an empty diff", () => {
    assert.deepEqual(parseDiff(""), []);
});

test("parseDiff handles a single-file diff", () => {
    const chunks = parseDiff(`diff --git a/only.js b/only.js\nindex 1..2 100644\n--- a/only.js\n+++ b/only.js\n@@ -1 +1 @@\n-x\n+y\n`);
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].file, "only.js");
});
