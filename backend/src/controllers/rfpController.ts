import { Request, Response } from "express";
import * as aiRfpParser from "../services/aiRfpParser";
import * as rfpService from "../services/rfpService";
import * as emailService from "../services/emailService";
import * as aiEvaluator from "../services/aiEvaluator";

export async function createRfpFromText(req: Request, res: Response) {
  const { description } = req.body;
  const structured = await aiRfpParser.parse(description);
  const rfp = await rfpService.createRfp(structured, description);
  res.status(201).json({ rfp });
}

export async function getAllRfps(req: Request, res: Response) {
  const rfps = await rfpService.listRfps();
  res.json(rfps);
}

export async function getRfpComparison(req: Request, res: Response) {
  const rfpId = req.params.id;
  const result = await rfpService.getRfpWithProposals(rfpId);
  const evaluated = await aiEvaluator.evaluate(result);
  res.json(evaluated);
}

export async function sendRfpToVendors(req: Request, res: Response) {
  const rfpId = req.params.id;
  const { vendorIds } = req.body;
  await emailService.sendRfpEmails(rfpId, vendorIds);
  res.json({ status: "ok" });
}
