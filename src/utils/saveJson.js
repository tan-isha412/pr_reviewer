import fs from "fs/promises";
import path from "path";

async function saveJson(filePath, data) {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
        filePath,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

export default saveJson;