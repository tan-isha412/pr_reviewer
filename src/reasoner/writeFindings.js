import fs from "fs/promises";
async function writeFindings(unique)
{
await fs.writeFile(
    "data/processed/findings.json",
    JSON.stringify(unique, null, 2)
);
}
export default writeFindings;