function formatComment(finding)
{
    let text = "## AI Code Review\n";
    text += "**Severity:** " + finding.severity + "\n\n";
    text += finding.explanation + "\n\n";
    text += "**Repository Evidence**\n";
    text += "https://github.com/{owner}/{repo}/pull/" + finding.citedPr + "\n\n";
    text += "File: " + finding.file + "\n";
    text += "Line: " + finding.line;

    return text;
}

export default formatComment;