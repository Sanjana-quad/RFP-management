// prisma/seed.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Create Vendors ---
  const vendor1 = await prisma.vendor.upsert({
    where: { email: "sales@techsupplies.com" },
    update: {},
    create: {
      name: "Tech Supplies Inc",
      contact_name: "Alice Johnson",
      email: "sales@techsupplies.com",
      phone: "+1-555-1234",
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { email: "quotes@digitronics.com" },
    update: {},
    create: {
      name: "Digitronics Global",
      contact_name: "Tom Parker",
      email: "quotes@digitronics.com",
      phone: "+1-555-5678",
    },
  });

  const vendor3 = await prisma.vendor.upsert({
    where: { email: "bids@premiertech.com" },
    update: {},
    create: {
      name: "PremierTech Solutions",
      contact_name: "Sandra Lee",
      email: "bids@premiertech.com",
      phone: "+1-555-9012",
    },
  });

  // --- Create RFP ---
  const rfp = await prisma.rfp.create({
    data: {
      title: "Laptops and Monitors for New Office",
      description:
        "We require 20 laptops (16GB RAM) and 15 monitors (27-inch) with a total budget cap of $50,000. " +
        "Delivery needed within 30 days. Payment terms Net 30. Warranty minimum 1 year.",
      budget: 50000,
      currency: "USD",
      delivery_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      payment_terms: "Net 30",
      warranty_terms: "1 year minimum",
      status: "SENT",
      items: {
        create: [
          {
            name: "Laptop",
            quantity: 20,
            specs_json: { ram: "16GB", storage: "512GB SSD" },
          },
          {
            name: "Monitor",
            quantity: 15,
            specs_json: { screen_size: "27-inch", type: "IPS" },
          },
        ],
      },
      rfpVendors: {
        create: [
          { vendor_id: vendor1.id, status: "INVITED" },
          { vendor_id: vendor2.id, status: "INVITED" },
          { vendor_id: vendor3.id, status: "INVITED" },
        ],
      },
    },
  });

  // --- Create Sample Proposals (Fake AI Responses) ---
  await prisma.proposal.create({
    data: {
      rfp_id: rfp.id,
      vendor_id: vendor1.id,
      total_price: 47000,
      currency: "USD",
      delivery_days: 28,
      payment_terms: "Net 30",
      warranty_terms: "1 year Standard",
      score_overall: 82,
      score_price: 85,
      score_terms: 78,
      score_risk: 80,
      ai_evaluation_summary:
        "Strong pricing and meets all requirements. Delivery on time. Warranty standard.",
    },
  });

  await prisma.proposal.create({
    data: {
      rfp_id: rfp.id,
      vendor_id: vendor2.id,
      total_price: 49000,
      currency: "USD",
      delivery_days: 20,
      payment_terms: "Net 45",
      warranty_terms: "2 years Extended",
      score_overall: 88,
      score_price: 80,
      score_terms: 92,
      score_risk: 90,
      ai_evaluation_summary:
        "Higher price but faster delivery and extended warranty provides long-term value.",
    },
  });

  await prisma.proposal.create({
    data: {
      rfp_id: rfp.id,
      vendor_id: vendor3.id,
      total_price: 45000,
      currency: "USD",
      delivery_days: 35,
      payment_terms: "Net 60",
      warranty_terms: "6 months",
      score_overall: 73,
      score_price: 90,
      score_terms: 65,
      score_risk: 70,
      ai_evaluation_summary:
        "Lowest price but slower delivery and weaker warranty increases operational risk.",
    },
  });

  console.log("🌱 Seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
