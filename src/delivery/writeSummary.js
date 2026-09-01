import fs from "fs/promises";

async function writeSummary(findings) {
    await fs.writeFile(
        "data/processed/summary.json",
        JSON.stringify(findings, null, 2)
    );
}

export default writeSummary;
