import faiss from "../utils/faiss/Polyfill.js";
import embedChunk from "./embedChunk.js";

async function buildTitleIndex(entries, dimension) {
    const index = new faiss.IndexFlatL2(dimension);
    const metadata = [];

    for (const entry of entries) {
        const vector = await embedChunk({ file: entry.file, diff: entry.title });
        if (!vector) continue;
        index.add(vector);
        metadata.push(entry);
    }

    if (index.ntotal !== metadata.length) {
        throw new Error(
            `Vector index/metadata mismatch: index has ${index.ntotal} vectors but metadata has ${metadata.length} entries.`
        );
    }

    return { index, metadata };
}

export default buildTitleIndex;
