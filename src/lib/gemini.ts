import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export async function testGemini() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain JavaScript in 3 simple sentences.",
  });

  return response.text;
}