import faiss from "../utils/faiss/Polyfill.js";
import path from "path";

async function loadIndex(dimension) {
    const filePath = path.join("data/processed", "faiss.index");
    const index = new faiss.IndexFlatL2(dimension);
    index.read(filePath);
    return index;
}

export default loadIndex;