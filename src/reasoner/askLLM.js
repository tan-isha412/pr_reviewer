import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});
async function askLLM(prompt) {
  try 
  {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });
    return response.text;
  } 
  catch (error) 
  {
    console.error('Error calling Gemini:', error);
    return "";
  }
}
export default askLLM;