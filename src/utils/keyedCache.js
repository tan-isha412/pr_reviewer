import saveJson from "./saveJson.js";

async function writeKeyed(dir, key, data) {
    await saveJson(`${dir}/${key}.json`, data);
}

export default writeKeyed;
