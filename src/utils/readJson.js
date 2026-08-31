import fs from "fs/promises";

async function readJson(path) {
try {
        const data = await fs.readFile(path, "utf8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            return [];
        }
        throw err;
    }

}

export default readJson;