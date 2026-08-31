import faiss from "../utils/faiss/Polyfill.js";
import readJson from "../utils/readJson.js";
import saveJson from "../utils/saveJson.js";
import embedChunk from "./embedChunk.js";

const METADATA_PATH = "data/processed/vector-metadata.json";

async function buildIndex(path, dimension) {

    const chunks = await readJson(path);
    const index = new faiss.IndexFlatL2(dimension);
    const metadata = [];

    for (const chunk of chunks) {
        const vector = await embedChunk(chunk);
        if (!vector) continue;
        index.add(vector);
        metadata.push(chunk);
    }

    if (index.ntotal !== metadata.length) {
        throw new Error(
            `Vector index/metadata mismatch: index has ${index.ntotal} vectors but metadata has ${metadata.length} entries. Every chunk pushed onto metadata must correspond to exactly one vector added to the index, in the same order.`
        );
    }

    await saveJson(METADATA_PATH, metadata);

    return { index, metadata };
}

export default buildIndex;
