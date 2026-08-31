import faiss from "../utils/faiss/Polyfill.js";
import embedChunk from "./embedChunk.js";

async function buildCommentIndex(comments, dimension) {
    const index = new faiss.IndexFlatL2(dimension);
    const metadata = [];

    for (const comment of comments) {
        metadata.push(comment);
        const vector = await embedChunk({ file: comment.path, diff: comment.body });
        if (!vector) continue;
        index.add(vector);
    }

    return { index, metadata };
}

export default buildCommentIndex;
