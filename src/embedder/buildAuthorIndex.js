import faiss from "../utils/faiss/Polyfill.js";
import embedChunk from "./embedChunk.js";

async function buildAuthorIndex(entries, dimension) {
    const index = new faiss.IndexFlatL2(dimension);
    const metadata = [];

    for (const entry of entries) {
        metadata.push(entry);
        const vector = await embedChunk({ file: entry.file, diff: entry.explanation });
        if (!vector) continue;
        index.add(vector);
    }

    return { index, metadata };
}

export default buildAuthorIndex;
