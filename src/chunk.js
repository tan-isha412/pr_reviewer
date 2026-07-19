import readJson from "./utils/readJson.js";
import saveJson from "./utils/saveJson.js";
import parseDiff from "./parser/parseDiff.js";
import attachComments from "./parser/attachComments.js";
import buildChunks from "./builder/buildChunks.js";

async function runChunk() {
    const data = await readJson("data/raw/decision-units.json");
    const allChunks = [];

    for (const unit of data) {
        const fileChunks = parseDiff(unit.diff);
        const chunksWithComments = attachComments(fileChunks, unit.review_comments);
        const builtChunks = buildChunks(unit, chunksWithComments);
        allChunks.push(...builtChunks);
    }

    await saveJson("data/processed/chunks.json", allChunks);
    console.log(`Saved ${allChunks.length} chunks.`);
}

export default runChunk;