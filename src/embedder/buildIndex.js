import faiss from "../utils/faiss/Polyfill.js";
import readJson from "../utils/readJson.js";
import embedChunk from "./embedChunk.js";

async function buildIndex(path, dimension) {

    const chunks = await readJson(path);
    const index = new faiss.IndexFlatL2(dimension);
    for (const chunk of chunks) {
        const vector = await embedChunk(chunk);
        if (!vector) continue;
        index.add(vector);
    }
    return {index,chunks};
}

export default buildIndex;