// src/services/emailService.ts
import nodemailer from "nodemailer";
import imaps, { ImapSimpleOptions } from "imap-simple";
import { simpleParser } from "mailparser";
import prisma from "../config/db";
import { parseProposal } from "./aiProposalParser";

export async function sendRfpEmails(rfpId: string, vendorIds: string[]) {
  const rfp = await prisma.rfp.findUnique({
    where: { id: rfpId },
    include: { items: true },
  });
  if (!rfp) throw new Error("RFP not found");

  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
  });

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  for (const vendor of vendors) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: vendor.email,
      // IMPORTANT: include RFP id in subject so we can match replies
      subject: `RFP ${rfp.id} - ${rfp.title}`,
      text: `Hello ${vendor.contact_name || vendor.name},

Please respond to this RFP:

Title: ${rfp.title}
Budget: ${rfp.budget ?? "N/A"} ${rfp.currency ?? ""}
Delivery deadline: ${rfp.delivery_deadline ? rfp.delivery_deadline.toISOString() : "N/A"
        }
Payment terms: ${rfp.payment_terms ?? "N/A"}
Warranty: ${rfp.warranty_terms ?? "N/A"}

Items:
${rfp.items
          .map((it: any) => `- ${it.quantity} x ${it.name} (${JSON.stringify(it.specs_json)})`)
          .join("\n")}

Please reply with your total price, delivery time in days, payment terms, and warranty.

Regards,
RFP System`.trim(),
    });

    await prisma.rfpVendor.upsert({
      where: { rfp_id_vendor_id: { rfp_id: rfpId, vendor_id: vendor.id } },
      update: { status: "INVITED" },
      create: { rfp_id: rfpId, vendor_id: vendor.id, status: "INVITED" },
    });
  }
}

// src/services/emailService.ts (only pollInbox function)

export async function pollInbox() {
  const {
    INBOUND_EMAIL_USER,
    INBOUND_EMAIL_PASS,
    INBOUND_EMAIL_HOST,
    INBOUND_EMAIL_PORT,
    INBOUND_EMAIL_TLS,
  } = process.env;

  if (
    !INBOUND_EMAIL_USER ||
    !INBOUND_EMAIL_PASS ||
    !INBOUND_EMAIL_HOST ||
    !INBOUND_EMAIL_PORT
  ) {
    throw new Error("Missing IMAP environment variables");
  }

  const config: ImapSimpleOptions = {
    imap: {
      user: INBOUND_EMAIL_USER,
      password: INBOUND_EMAIL_PASS,
      host: INBOUND_EMAIL_HOST,
      port: Number(INBOUND_EMAIL_PORT),
      tls: INBOUND_EMAIL_TLS === "true",
      tlsOptions: {
        rejectUnauthorized: false,
      },
      authTimeout: 10000,
    },
  };

  const connection = await imaps.connect(config);

  // 🔍 1) List mailboxes once (optional, just to see names)
  const boxes = await connection.getBoxes();
  console.log("[pollInbox] Mailboxes:", Object.keys(boxes));

  // 🔄 2) For Gmail, use All Mail folder for debugging:
  // await connection.openBox("INBOX");               // original
  await connection.openBox("[Gmail]/All Mail");      // 👈 debug: search ALL mail

  // 🔍 3) Use ALL instead of UNSEEN for now
  const searchCriteria = ["ALL"]; // later you can change back to ["UNSEEN"]

  const fetchOptions = {
    bodies: ["HEADER.FIELDS (FROM TO SUBJECT)", "TEXT"],
    struct: true,
    markSeen: false, // don't change read state while debugging
  };

  const messages = await connection.search(searchCriteria, fetchOptions);
  console.log("[pollInbox] Found messages:", messages.length);

  let processed = 0;

  for (const msg of messages) {
    try {
      const headerPart = msg.parts.find((p: any) =>
        p.which?.startsWith("HEADER")
      );
      const textPart = msg.parts.find((p: any) => p.which === "TEXT");

      if (!textPart || !textPart.body) {
        continue;
      }
      // //////////////////////////////////////////////////////////////////////////////////////// 1

      const headerBody: any = headerPart?.body || {};

      // rawFromVal might be string, array, or something else
      const rawFromVal = headerBody.from ?? headerBody.From ?? "";
      let rawFromStr = "";

      if (Array.isArray(rawFromVal)) {
        rawFromStr = rawFromVal[0] ?? "";
      } else if (typeof rawFromVal === "string") {
        rawFromStr = rawFromVal;
      } else {
        rawFromStr = String(rawFromVal ?? "");
      }

      // subject can also be array or string
      const rawSubjectVal = headerBody.subject ?? headerBody.Subject ?? "";
      let rawSubjectStr = "";

      if (Array.isArray(rawSubjectVal)) {
        rawSubjectStr = rawSubjectVal[0] ?? "";
      } else if (typeof rawSubjectVal === "string") {
        rawSubjectStr = rawSubjectVal;
      } else {
        rawSubjectStr = String(rawSubjectVal ?? "");
      }

      console.log("[pollInbox] RAW FROM VAL:", rawFromVal);
      console.log("[pollInbox] RAW FROM STR:", rawFromStr);
      console.log("[pollInbox] RAW SUBJECT STR:", rawSubjectStr);

      // Extract pure email from "Name <email>"
      let fromEmail = "";
      const m = rawFromStr.match(/<([^>]+)>/);
      if (m) {
        fromEmail = m[1].trim(); // vendor@example.com
      } else {
        fromEmail = rawFromStr.trim(); // maybe already just email
      }

      if (!fromEmail) {
        console.log("[pollInbox] No fromEmail, skipping message");
        continue;
      }

      const subject = rawSubjectStr;


      // //////////////////////////////////////////////////////////////////////////////////////////// 2

      // if (m) {
      //   fromEmail = m[1].trim();
      // } else {
      //   fromEmail = rawFrom.trim();
      // }

      // console.log("[pollInbox] RAW FROM:", rawFrom);
      // console.log("[pollInbox] Parsed fromEmail:", fromEmail);
      // console.log("[pollInbox] Subject:", rawSubject);
      
      // 🔍 FILTER #1: only keep emails from your Gmail (as "vendor")
      if (fromEmail.toLowerCase() !== INBOUND_EMAIL_USER.toLowerCase()) {
        // Ignore all GeeksforGeeks/Glassdoor/Swiggy/etc
        continue;
      }

      // 🔍 FILTER #2: only keep subjects that contain "RFP "
      if (!subject.includes("RFP ")) {
        continue;
      }
      console.log("[pollInbox] RAW FROM VAL:", rawFromVal);
      console.log("[pollInbox] RAW FROM STR:", rawFromStr);
      console.log("[pollInbox] RAW SUBJECT STR:", rawSubjectStr);

      if (!fromEmail) {
        console.log("[pollInbox] No fromEmail, skipping message");
        continue;
      }

      const parsed = await simpleParser(textPart.body);
      const body = parsed.text || parsed.html || "";

      // Map to vendor
      const vendor = await prisma.vendor.findFirst({
        where: { email: { equals: fromEmail, mode: "insensitive" } },
      });
      if (!vendor) {
        console.log("[pollInbox] No vendor for:", fromEmail);
        continue;
      }

      // Map subject -> RFP (RFP <id>)
      let rfp = null;
      const rfpIdMatch = subject.match(/RFP\s+([0-9a-fA-F-]+)/);
      if (rfpIdMatch) {
        const rfpId = rfpIdMatch[1];
        rfp = await prisma.rfp.findUnique({
          where: { id: rfpId },
          include: { items: true },
        });
      }

      if (!rfp) {
        const cleaned = subject.replace(/^Re:\s*/i, "").trim();
        rfp = await prisma.rfp.findFirst({
          where: {
            title: { contains: cleaned, mode: "insensitive" },
          },
          include: { items: true },
        });
      }

      if (!rfp) {
        console.log("[pollInbox] No RFP found for subject:", subject);
        continue;
      }

      const structured = await parseProposal(body, rfp);

      await prisma.proposal.upsert({
        where: {
          rfp_id_vendor_id: {
            rfp_id: rfp.id,
            vendor_id: vendor.id,
          },
        },
        update: {
          raw_email_body: body,
          total_price: structured.total_price,
          currency: structured.currency,
          delivery_days: structured.delivery_days,
          payment_terms: structured.payment_terms,
          warranty_terms: structured.warranty_terms,
        },
        create: {
          rfp_id: rfp.id,
          vendor_id: vendor.id,
          raw_email_body: body,
          total_price: structured.total_price,
          currency: structured.currency,
          delivery_days: structured.delivery_days,
          payment_terms: structured.payment_terms,
          warranty_terms: structured.warranty_terms,
        },
      });

      processed++;
    } catch (err: any) {
      console.error("[pollInbox] Error processing message:", err?.message || err);
    }
  }

  await connection.end();
  console.log(`[pollInbox] Processed ${processed} messages`);
  return { processed };
}
