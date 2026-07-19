import fs from "fs/promises";

async function saveJson(path, data) {

    await fs.writeFile(
        path,
        JSON.stringify(data, null, 2),
        "utf8"
    );

}

export default saveJson;