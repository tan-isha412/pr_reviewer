import { GoogleGenAI } from "@google/genai";
const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
async function embedChunk(chunk)
{
    const text = `Title: ${chunk.title}
        File: ${chunk.file}
        Diff:${chunk.diff}
        Comments:${chunk.comments.map(c => c.body).join("\n")}`;
        try{
    const result = await ai.models.embedContent({model:"text-embedding-004",contents:text});
    
    return result.embeddings[0].values;
}
    catch (err) {
    console.error(`Failed to embed ${chunk.file}:`, err.message);
    return null;
}
}
export default embedChunk;