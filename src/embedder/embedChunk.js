import { GoogleGenAI } from "@google/genai";

async function embedChunk(chunk) {
    const commentsText = Array.isArray(chunk.comments) ? chunk.comments.map(c => c.body).join("\n") : "";
    const text = `Title: ${chunk.title || ""}
        File: ${chunk.file || ""}
        Diff:${chunk.diff || ""}
        Comments:${commentsText}`;
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not configured.");
            return null;
        }
        const ai = new GoogleGenAI({ apiKey });
        const result = await ai.models.embedContent({ model: "gemini-embedding-001", contents: text });
    return result.embeddings[0].values;
}
    catch (err) {
    console.error(`Failed to embed ${chunk.file}:`, err.message);
    return null;
}
}
export default embedChunk;