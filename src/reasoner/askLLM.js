import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function askLLM(prompt) {
  try 
  {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
        const cleaned = response.text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);

  } 
  catch (error) 
  {
    console.error('Error calling Gemini:', error);
  }
}
export default askLLM;