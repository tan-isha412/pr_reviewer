import path from "path";

async function saveIndex(index) {
    const filePath = path.join("data/processed", "faiss.index");
    index.write(filePath);

}

export default saveIndex;