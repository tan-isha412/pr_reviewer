import { GoogleGenAI } from "@google/genai";

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function embedChunk(chunk) {
    const commentsText = Array.isArray(chunk.comments) ? chunk.comments.map(c => c.body).join("\n") : "";
    const text = `Title: ${chunk.title || ""}
        File: ${chunk.file || ""}
        Diff:${chunk.diff || ""}
        Comments:${commentsText}`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not configured.");
        return null;
    }
    const ai = new GoogleGenAI({ apiKey });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const result = await ai.models.embedContent({ model: "gemini-embedding-001", contents: text });
            return result.embeddings[0].values;
        } catch (err) {
            const isLastAttempt = attempt === MAX_ATTEMPTS;
            console.error(`Failed to embed ${chunk.file} (attempt ${attempt}/${MAX_ATTEMPTS}):`, err.message);
            if (isLastAttempt) {
                return null;
            }
            await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
        }
    }
}
export default embedChunk;
