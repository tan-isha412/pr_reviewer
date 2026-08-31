import { test } from "node:test";
import assert from "node:assert/strict";
import shouldSkip from "../../src/reasoner/shouldSkip.js";

test("shouldSkip is true for null, undefined, non-array, or empty matches", () => {
    assert.equal(shouldSkip(null), true);
    assert.equal(shouldSkip(undefined), true);
    assert.equal(shouldSkip("not an array"), true);
    assert.equal(shouldSkip([]), true);
});

test("shouldSkip is false when at least one match meets the default 0.75 threshold", () => {
    const matches = [{ similarityScore: 0.5 }, { similarityScore: 0.9 }];
    assert.equal(shouldSkip(matches), false);
});

test("shouldSkip is true when every match is below the default threshold", () => {
    const matches = [{ similarityScore: 0.1 }, { similarityScore: 0.5 }];
    assert.equal(shouldSkip(matches), true);
});

test("shouldSkip respects a custom threshold", () => {
    const matches = [{ similarityScore: 0.6 }];
    assert.equal(shouldSkip(matches, 0.5), false);
    assert.equal(shouldSkip(matches, 0.7), true);
});
