import fs from "fs";
import path from "path";

class IndexFlatL2 {
    constructor(dimension) {
        this.dimension = dimension || 0;
        this.vectors = [];
    }

    add(vector) {
        if (!Array.isArray(vector)) {
            throw new Error("Vector must be an array");
        }
        this.vectors.push(vector);
    }

    search(queryVector, k) {
        if (!Array.isArray(queryVector)) {
            throw new Error("Query vector must be an array");
        }
        const scored = this.vectors.map((vec, idx) => {
            let sumSq = 0;
            const len = Math.min(vec.length, queryVector.length);
            for (let i = 0; i < len; i++) {
                const diff = vec[i] - queryVector[i];
                sumSq += diff * diff;
            }
            return { index: idx, distance: sumSq };
        });

        scored.sort((a, b) => a.distance - b.distance);

        const topK = scored.slice(0, k);

        const distances = topK.map(item => item.distance);
        const labels = topK.map(item => item.index);

        while (distances.length < k) {
            distances.push(Infinity);
            labels.push(-1);
        }

        return { distances, labels };
    }

    write(filepath) {
        const dir = path.dirname(filepath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = {
            dimension: this.dimension,
            vectors: this.vectors
        };
        fs.writeFileSync(filepath, JSON.stringify(data), "utf8");
    }

    read(filepath) {
        if (!fs.existsSync(filepath)) {
            console.warn(`FAISS index file not found at: ${filepath}. Starting with an empty index.`);
            return this;
        }
        const raw = fs.readFileSync(filepath, "utf8");
        const data = JSON.parse(raw);
        this.dimension = data.dimension;
        this.vectors = data.vectors;
        return this;
    }

    static read(filepath) {
        const index = new IndexFlatL2();
        index.read(filepath);
        return index;
    }
}

export default {
    IndexFlatL2
};
