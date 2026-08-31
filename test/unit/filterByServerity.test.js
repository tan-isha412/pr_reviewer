import { test } from "node:test";
import assert from "node:assert/strict";
import filterBySeverity from "../../src/reasoner/filterByServerity.js";

test("filterBySeverity drops findings that don't deviate", () => {
    const findings = [{ deviates: false, severity: "high" }];
    assert.deepEqual(filterBySeverity(findings), []);
});

test("filterBySeverity drops findings below the default 'medium' threshold", () => {
    const findings = [
        { deviates: true, severity: "low" },
        { deviates: true, severity: "medium" },
        { deviates: true, severity: "high" },
    ];
    const result = filterBySeverity(findings);
    assert.equal(result.length, 2);
    assert.deepEqual(result.map((f) => f.severity), ["medium", "high"]);
});

test("filterBySeverity respects a custom minSeverity", () => {
    const findings = [
        { deviates: true, severity: "low" },
        { deviates: true, severity: "high" },
    ];
    const result = filterBySeverity(findings, "high");
    assert.equal(result.length, 1);
    assert.equal(result[0].severity, "high");
});

test("filterBySeverity returns an empty array when nothing qualifies", () => {
    const findings = [{ deviates: true, severity: "low" }];
    assert.deepEqual(filterBySeverity(findings), []);
});
