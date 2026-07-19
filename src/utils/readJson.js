import fs from "fs/promises";

async function readJson(path) {

    const data = await fs.readFile(path, "utf8");

    return JSON.parse(data);

}

export default readJson;