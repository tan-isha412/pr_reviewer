import { test } from "node:test";
import assert from "node:assert/strict";
import formatComment from "../../src/delivery/formatComment.js";

test("formatComment includes severity, explanation, cited PR, file, and line", () => {
    const finding = {
        severity: "high",
        explanation: "This deviates from the established error-handling pattern.",
        citedPr: 15,
        file: "src/foo.js",
        line: 42,
    };

    const text = formatComment(finding);

    assert.ok(text.includes("high"));
    assert.ok(text.includes("This deviates from the established error-handling pattern."));
    assert.ok(text.includes("pull/15"));
    assert.ok(text.includes("src/foo.js"));
    assert.ok(text.includes("42"));
});
