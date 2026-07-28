import dotenv from "dotenv";
import runIngest from "./ingest.js";
import runChunk from "./chunk.js";
import buildIndex from "./embedder/buildIndex.js";
import saveIndex from "./embedder/saveIndex.js";

dotenv.config();

async function runPreprocessing() {
    const owner = process.argv[2] || process.env.GITHUB_OWNER;
    const repo = process.argv[3] || process.env.GITHUB_REPO;

    console.log("=== Starting Offline Preprocessing Pipeline ===");

    // Step 1: Ingest historical merged PRs into decision-units.json
    if (owner && repo) {
        console.log(`[1/4] Running runIngest() for repository: ${owner}/${repo}...`);
        await runIngest(owner, repo);
        console.log("Ingestion complete -> saved data/raw/decision-units.json");
    } else {
        console.log("[1/4] Repository owner/repo not passed via CLI args or env vars.");
        console.log("Skipping runIngest() and proceeding with existing data/raw/decision-units.json...");
    }

    // Step 2: Parse diffs & attach comments into chunks.json
    console.log("[2/4] Running runChunk()...");
    await runChunk();
    console.log("Chunking complete -> saved data/processed/chunks.json");

    // Step 3: Embed chunks and build vector index
    console.log("[3/4] Running buildIndex()...");
    const chunksPath = "data/processed/chunks.json";
    const dimension = 768; // text-embedding-004 output dimension
    const { index } = await buildIndex(chunksPath, dimension);
    console.log("Index built successfully.");

    // Step 4: Save FAISS index
    console.log("[4/4] Running saveIndex()...");
    await saveIndex(index);
    console.log("Saved index -> data/processed/faiss.index");

    console.log("=== Preprocessing Pipeline Completed Successfully ===");
}

runPreprocessing().catch((err) => {
    console.error("Preprocessing pipeline failed:", err);
    process.exit(1);
});
