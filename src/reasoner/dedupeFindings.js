import { GoogleGenAI } from "@google/genai";
import computeSimilarity from "./computeSimilarity.js";

async function dedupeFindings(findings) {
    if (!Array.isArray(findings) || findings.length === 0) return [];
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return findings;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const unique = [];

        for (const c of findings) {
            if (!c || !c.explanation) {
                unique.push({ finding: c, vector: null });
                continue;
            }
            try {
                const res1 = await ai.models.embedContent({
                    model: "gemini-embedding-001",
                    contents: c.explanation
                });
                const v1 = res1.embeddings?.[0]?.values;
                if (!v1) {
                    unique.push({ finding: c, vector: null });
                    continue;
                }
                let dup = false;
                for (const un of unique) {
                    if (!un.vector) continue;
                    const sim = computeSimilarity(v1, un.vector);
                    if (sim > 0.9) {
                        dup = true;
                        break;
                    }
                }
                if (!dup) {
                    unique.push({ finding: c, vector: v1 });
                }
            } catch (err) {
                console.error("Error embedding finding explanation during dedupe:", err.message);
                unique.push({ finding: c, vector: null });
            }
        }
        return unique.map(item => item.finding);
    } catch (err) {
        console.error("Dedupe error:", err.message);
        return findings;
    }
}

export default dedupeFindings;