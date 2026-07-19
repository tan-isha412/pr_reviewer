async function runChunk() {
    const data = await readJson("data/raw/decision-units.json");
    const allChunks = [];

    for (const unit of data) {
        const fileChunks = parseDiff(unit.diff);
        const chunksWithComments = attachComments(fileChunks, unit.review_comments);
        const buildChunks=buildChunks(unit,chunksWithComments)
        allChunks.push(...chunksWithComments);
    }

    await saveJson("data/processed/chunks.json", allChunks);
    console.log(`Saved ${allChunks.length} chunks.`);
}

export default runChunk;