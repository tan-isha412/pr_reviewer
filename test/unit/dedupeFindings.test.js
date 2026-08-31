import { test } from "node:test";
import assert from "node:assert/strict";
import dedupeFindings from "../../src/reasoner/dedupeFindings.js";

test("dedupeFindings returns [] for non-array or empty input", async () => {
    assert.deepEqual(await dedupeFindings(null), []);
    assert.deepEqual(await dedupeFindings(undefined), []);
    assert.deepEqual(await dedupeFindings([]), []);
});

test("dedupeFindings returns findings unchanged when GEMINI_API_KEY is not configured", async () => {
    const original = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    try {
        const findings = [
            { explanation: "same issue", file: "a.js" },
            { explanation: "same issue", file: "b.js" },
        ];
        const result = await dedupeFindings(findings);
        assert.deepEqual(result, findings);
    } finally {
        if (original === undefined) delete process.env.GEMINI_API_KEY;
        else process.env.GEMINI_API_KEY = original;
    }
});
