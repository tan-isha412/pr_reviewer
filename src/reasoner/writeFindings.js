import saveJson from "../utils/saveJson.js";

async function writeFindings(unique, context)
{
    const { repo, prNumber, commitId } = context || {};
    const key = repo && prNumber && commitId
        ? `${repo}-pr${prNumber}-${commitId}`
        : `findings-${Date.now()}`;
    await saveJson(`data/processed/findings/${key}.json`, unique);
}
export default writeFindings;