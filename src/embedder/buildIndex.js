import faiss from "faiss-node";
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