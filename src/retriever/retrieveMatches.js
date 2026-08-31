import fetchDiff from "../github/fetchDiff.js";
import parseDiff from "../parser/parseDiff.js";
import embedChunk from "../embedder/embedChunk.js";
import loadIndex from "../embedder/loadIndex.js";
import readJson from "../utils/readJson.js";

async function retrieveMatches(owner, repo, prNumber, dim,k) {
    const diff = await fetchDiff(owner, repo, prNumber);
    const queryChunks = parseDiff(diff);
    const index = await loadIndex(dim);
    const storedChunks = await readJson("data/processed/vector-metadata.json");
    const results = [];
    for (const chunk of queryChunks) {
        const vector = await embedChunk(chunk);
        const searchResult = index.search(vector, k);
        const matches = [];
        for (let i = 0; i < searchResult.labels.length; i++) {
            const id = searchResult.labels[i];
            const score = searchResult.distances[i];
            if (id === -1) continue;
            if (score < 0.75) continue;
            matches.push({
                ...storedChunks[id],
                similarityScore: score
            });
        }
        results.push({
            newChunk: chunk,
            matches
        });
    }
    return results;
}

export default retrieveMatches;