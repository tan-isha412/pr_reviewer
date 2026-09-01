import sleep from "./sleep.js";

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

async function fetchWithRetry(fn) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === MAX_ATTEMPTS) throw err;
            await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
        }
    }
}

export default fetchWithRetry;
