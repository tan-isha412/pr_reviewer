function filterBySeverity(findings, minSeverity = "medium") {

    const rank = {
        low: 0,
        medium: 1,
        high: 2
    };

    return findings.filter(
        finding =>
            finding.deviates &&
            rank[finding.severity] >= rank[minSeverity]
    );

}

export default filterBySeverity;