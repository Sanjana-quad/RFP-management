// import OpenAI from "openai";
// const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// export async function evaluate(rfpWithProposals: any) {
//   if (!rfpWithProposals?.proposals?.length) return rfpWithProposals;

//   const prompt = `
// You evaluate vendor proposals.

// Compute:
// - score_price (0-100)
// - score_terms (0-100)
// - score_risk (0-100)
// - score_overall
// - recommended_vendor_id
// - reason (explain briefly)

// Return JSON.

// RFP:
// ${JSON.stringify(rfpWithProposals.rfp, null, 2)}

// Proposals:
// ${JSON.stringify(rfpWithProposals.proposals, null, 2)}
// `;

//   const response = await client.chat.completions.create({
//     model: "gpt-4.1-mini",
//     messages: [
//       { role: "system", content: "You compare vendor proposals." },
//       { role: "user", content: prompt }
//     ],
//     response_format: { type: "json_object" }
//   });

//   const result = JSON.parse(response.choices[0].message.content!);

//   return {
//     rfp: rfpWithProposals,
//     proposals: rfpWithProposals.proposals,
//     ...result
//   };
// }

import { generateJson } from "./llmclient";

export async function evaluate(rfpWithProposals: any) {
  if (!rfpWithProposals || !rfpWithProposals.proposals?.length) {
    return {
      rfp: rfpWithProposals,
      proposals: rfpWithProposals?.proposals || [],
      ai_overall_recommendation: null,
    };
  }

  const systemPrompt = `
You are an expert procurement analyst.
Given an RFP and several vendor proposals, you assign scores:

For each proposal:
- score_price: 0-100, higher is better (lower price)
- score_terms: 0-100, better payment and warranty terms
- score_risk: 0-100, lower delivery delays and fewer red flags
- score_overall: 0-100, weighted combination

You also pick a single "recommended_vendor_id" and provide a short human-readable "reason".
`;

  const userPrompt = `
RFP:
${JSON.stringify(rfpWithProposals, null, 2)}

Proposals:
${JSON.stringify(rfpWithProposals.proposals, null, 2)}

Return ONLY JSON with this structure:
{
  "proposals": [
    {
      "id": "proposal_id",
      "score_price": 0,
      "score_terms": 0,
      "score_risk": 0,
      "score_overall": 0,
      "ai_evaluation_summary": ""
    }
  ],
  "ai_overall_recommendation": {
    "recommended_vendor_id": "some_vendor_id",
    "reason": "short reason"
  }
}
`;

  const result = await generateJson(systemPrompt, userPrompt);

  // Merge the scores back onto original proposals by id
  const scoredProposals = rfpWithProposals.proposals.map((p: any) => {
    const scored = result.proposals.find((sp: any) => sp.id === p.id) || {};
    return {
      ...p,
      score_price: scored.score_price ?? p.score_price ?? null,
      score_terms: scored.score_terms ?? p.score_terms ?? null,
      score_risk: scored.score_risk ?? p.score_risk ?? null,
      score_overall: scored.score_overall ?? p.score_overall ?? null,
      ai_evaluation_summary: scored.ai_evaluation_summary ?? p.ai_evaluation_summary ?? null,
    };
  });

  return {
    rfp: rfpWithProposals,
    proposals: scoredProposals,
    ai_overall_recommendation: result.ai_overall_recommendation || null,
  };
}
