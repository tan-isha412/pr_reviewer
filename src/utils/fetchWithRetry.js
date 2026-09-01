const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
