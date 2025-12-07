import prisma from "../config/db";

export async function createRfp(structured: any, originalText: string) {
  // 1. Safely compute delivery_deadline
  let delivery_deadline: Date | null = null;

  if (structured.delivery_deadline) {
    const raw = String(structured.delivery_deadline).trim();

    // Try direct Date parse first (ISO or standard date formats)
    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      delivery_deadline = parsed;
    } else {
      // Try to interpret things like "30 days", "within 20 days", etc.
      const match = raw.match(/(\d+)\s*day/i);
      if (match) {
        const days = parseInt(match[1], 10);
        if (!Number.isNaN(days)) {
          delivery_deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        }
      }
      // If we still couldn't parse, leave it as null
    }
  }

  // 2. Safely handle items so we don't crash if AI returns nothing
  const items = Array.isArray(structured.items) ? structured.items : [];

  return prisma.rfp.create({
    data: {
      title: structured.title || "Untitled RFP",
      description: originalText,
      budget: structured.budget ?? null,
      currency: structured.currency || null,
      delivery_deadline, // <-- safe Date | null
      payment_terms: structured.payment_terms || null,
      warranty_terms: structured.warranty_terms || null,
      items: {
        create: items.map((it: any) => ({
          name: it.name || "Item",
          quantity: it.quantity ?? 0,
          specs_json: it.specs || {},
        })),
      },
    },
    include: { items: true },
  });
}

export async function listRfps() {
  return prisma.rfp.findMany({ include: { items: true } });
}

export async function getRfpWithProposals(rfpId: string) {
  return prisma.rfp.findUnique({
    where: { id: rfpId },
    include: {
      items: true,
      proposals: {
        include: {
          vendor: true,
        },
      },
    },
  });
}
