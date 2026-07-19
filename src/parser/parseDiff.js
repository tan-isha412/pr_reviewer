function parseDiff(diff) 
{
    const sections = diff.split("diff --git").filter(Boolean);
    const chunks = [];
    for (const section of sections) 
    {
        const firstLine = section.split("\n")[0];
        const parts = firstLine.trim().split(" ");
        const file = parts[0].replace("a/", "");
        const diffBody = section.split("\n").slice(1).join("\n");
        chunks.push({file,diff: diffBody});
    }
    return chunks;
}
export default parseDiff;