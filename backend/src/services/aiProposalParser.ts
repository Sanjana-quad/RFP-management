// import OpenAI from "openai";
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function parseProposal(emailBody: string, rfp: any) {
//   const prompt = `
// Given RFP:
// ${JSON.stringify(rfp, null, 2)}

// Extract from vendor email:
// - total_price
// - currency
// - delivery_days
// - payment_terms
// - warranty_terms

// Return JSON only.`

//   const response = await client.chat.completions.create({
//     model: "gpt-4.1-mini",
//     messages: [
//       { role: "system", content: "Parse vendor proposal responses into JSON." },
//       { role: "user", content: prompt + "\nEmail:\n" + emailBody }
//     ],
//     response_format: { type: "json_object" }
//   });

//   return JSON.parse(response.choices[0].message.content!);
// }

import { generateJson } from "./llmclient";

export async function parseProposal(emailBody: string, rfp: any) {
  const systemPrompt = `
You parse vendor proposal emails into structured fields.

Given the RFP context and email body, extract:
- total_price (number, if present)
- currency (string, like "USD")
- delivery_days (integer, days from now or from RFP request)
- payment_terms (string)
- warranty_terms (string)
`;

  const userPrompt = `
RFP:
${JSON.stringify(rfp, null, 2)}

Vendor email:
${emailBody}

Return ONLY JSON with this shape:
{
  "total_price": 0,
  "currency": "",
  "delivery_days": 0,
  "payment_terms": "",
  "warranty_terms": ""
}
`;

  const json = await generateJson(systemPrompt, userPrompt);
  return json;
}
