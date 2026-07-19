import { GoogleGenAI } from "@google/genai";
import computeSimilarity from "./computeSimilarity.js";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function dedupeFindings(findings)
{
    const unique = [];

    for (const c of findings)
    {
        const res1 = await ai.models.embedContent({
            model: "text-embedding-004",
            contents: c.explanation
        }); 
        const v1 = res1.embeddings[0].values;
        let dup = false;
        for (const un of unique)
        {
            const sim = computeSimilarity(v1, un.vector);
            if (sim > 0.9)
            {
                dup = true;
                break;
            }
        }
        if (!dup)
            unique.push({finding: c,vector: v1});
    }
    return unique;
}

export default dedupeFindings;