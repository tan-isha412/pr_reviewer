import { test, mock } from "node:test";
import assert from "node:assert/strict";

const repoRoot = "/home/user/pr_reviewer";
const url = (rel) => new URL(rel, `file://${repoRoot}/`).href;

// A fixture 3-vector FAISS index (built with the real IndexFlatL2 polyfill,
// not a mock) plus fixture metadata that lines up 1:1 with it, the same
// invariant buildIndex.js guarantees in production.
const FIXTURE_VECTORS = [
    [0, 1, 0], // id 0: orthogonal (unrelated)
    [0.99, 0.05, 0], // id 1: near-identical to the query vector
    [-1, 0, 0], // id 2: opposite direction
];
const FIXTURE_METADATA = [
    { file: "unrelated.js", prNumber: 1, title: "Unrelated change", diff: "d1", comments: [] },
    { file: "auth.js", prNumber: 2, title: "Auth refactor", diff: "d2", comments: [] },
    { file: "opposite.js", prNumber: 3, title: "Opposite vector", diff: "d3", comments: [] },
];
const QUERY_VECTOR = [1, 0, 0];

mock.module(url("src/github/fetchDiff.js"), {
    defaultExport: async () => `diff --git a/auth.js b/auth.js
index 1..2 100644
--- a/auth.js
+++ b/auth.js
@@ -1 +1 @@
-old
+new
`,
});

mock.module(url("src/embedder/embedChunk.js"), {
    defaultExport: async () => QUERY_VECTOR,
});

mock.module(url("src/embedder/loadIndex.js"), {
    defaultExport: async () => {
        const { default: faiss } = await import(url("src/utils/faiss/Polyfill.js"));
        const index = new faiss.IndexFlatL2(3);
        for (const v of FIXTURE_VECTORS) index.add(v);
        return index;
    },
});

mock.module(url("src/utils/readJson.js"), {
    defaultExport: async () => FIXTURE_METADATA,
});

test("retrieveMatches maps a FAISS label back to the correct stored chunk", async () => {
    const { default: retrieveMatches } = await import(url("src/retriever/retrieveMatches.js"));

    const results = await retrieveMatches("acme", "repo", 99, 3, 3);

    assert.equal(results.length, 1);
    const { matches } = results[0];

    // Only the near-identical vector clears the 0.75 cosine-similarity bar;
    // the unrelated and opposite-direction vectors must be excluded.
    assert.equal(matches.length, 1);
    assert.equal(matches[0].file, "auth.js");
    assert.equal(matches[0].prNumber, 2);
    assert.ok(matches[0].similarityScore >= 0.75);
});
