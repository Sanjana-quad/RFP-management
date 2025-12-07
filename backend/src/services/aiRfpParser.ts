// // src/services/aiRfpParser.ts
// import "dotenv/config";
// import OpenAI from "openai";

// const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

// let client: OpenAI | null = null;
// const apiKey = process.env.OPENAI_API_KEY;

// if (!USE_MOCK_AI) {
//   if (!apiKey) {
//     throw new Error("OPENAI_API_KEY is not set, and USE_MOCK_AI is false");
//   }
//   client = new OpenAI({ apiKey });
// }

// // A small helper: mock structured RFP used when AI is not available
// function mockRfpFromText(description: string) {
//   // You can customize this, but let's hard-code something that matches the assignment example
//   return {
//     title: "Laptops and Monitors for New Office",
//     budget: 50000,
//     currency: "USD",
//     delivery_deadline: null,
//     payment_terms: "Net 30",
//     warranty_terms: "At least 1 year",
//     items: [
//       {
//         name: "Laptop",
//         quantity: 20,
//         specs: { ram: "16GB" },
//       },
//       {
//         name: "Monitor",
//         quantity: 15,
//         specs: { size: "27-inch" },
//       },
//     ],
//   };
// }

// export async function parse(description: string) {
//   // If in mock mode, just return fake structured data
//   if (USE_MOCK_AI || !client) {
//     console.log("[aiRfpParser] Using MOCK AI for RFP parsing");
//     return mockRfpFromText(description);
//   }

//   try {
//     const prompt = `
// Convert the following procurement description into a structured RFP.
// Extract:
// - title
// - budget (number, if present)
// - currency (e.g. "USD")
// - delivery_deadline (if any, as plain text)
// - payment_terms
// - warranty_terms
// - items: array of { name, quantity, specs (object) }

// Return ONLY valid JSON with this shape:
// {
//   "title": "",
//   "budget": 0,
//   "currency": "",
//   "delivery_deadline": "",
//   "payment_terms": "",
//   "warranty_terms": "",
//   "items": [
//     { "name": "", "quantity": 0, "specs": {} }
//   ]
// }
// `;

//     const response = await client.chat.completions.create({
//       model: "gpt-4.1-mini",
//       messages: [
//         { role: "system", content: "You convert procurement text into structured JSON." },
//         { role: "user", content: prompt + "\n\nDescription:\n" + description },
//       ],
//       response_format: { type: "json_object" },
//     });

//     const content = response.choices[0].message.content;
//     if (!content) {
//       throw new Error("Empty AI response");
//     }

//     return JSON.parse(content);
//   } catch (err: any) {
//     console.error("[aiRfpParser] Error calling OpenAI:", err?.message || err);
//     // If OpenAI returns 429 or any error, fall back to mock
//     console.log("[aiRfpParser] Falling back to MOCK RFP due to AI error.");
//     return mockRfpFromText(description);
//   }
// }

import { generateJson } from "./llmclient";

export async function parse(description: string) {
  const systemPrompt = `
You are an assistant that converts free-form procurement requests into a structured RFP JSON.
Extract:
- title
- budget (number if present, else null)
- currency (like "USD", "INR", etc., or null)
- delivery_deadline (string summary of any timing requirement, or null)
- payment_terms (string or null)
- warranty_terms (string or null)
- items: array of { name, quantity, specs (object) }

Return ONLY JSON with this shape:
{
  "title": "",
  "budget": 0,
  "currency": "",
  "delivery_deadline": "",
  "payment_terms": "",
  "warranty_terms": "",
  "items": [
    { "name": "", "quantity": 0, "specs": {} }
  ]
}
`;

  const userPrompt = `Description:\n${description}`;

  const json = await generateJson(systemPrompt, userPrompt);
  return json;
}
