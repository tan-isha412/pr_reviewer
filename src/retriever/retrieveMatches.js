import fetchDiff from "../github/fetchDiff.js";
import parseDiff from "../parser/parseDiff.js";
import embedChunk from "../embedder/embedChunk.js";
import loadIndex from "../embedder/loadIndex.js";
import readJson from "../utils/readJson.js";
import computeSimilarity from "../reasoner/computeSimilarity.js";

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
            if (id === -1) continue;
            // FAISS returns a raw L2 distance (unbounded, lower = closer), not a
            // similarity score. Recompute cosine similarity so the 0.75 threshold
            // (also used by shouldSkip.js) means what its name says: higher is
            // more similar, and near matches are kept rather than discarded.
            const score = computeSimilarity(vector, index.vectors[id]);
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