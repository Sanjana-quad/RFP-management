// backend/src/services/llmClient.ts
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY not set in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function generateJson(systemPrompt: string, userPrompt: string): Promise<any> {
  const result = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              systemPrompt +
              "\n\n" +
              userPrompt +
              "\n\nRespond with ONLY valid JSON, no extra text.",
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  return JSON.parse(text);
}
