import { Request, Response } from "express";
import * as emailService from "../services/emailService";

export async function pollEmails(req: Request, res: Response) {
  const result = await emailService.pollInbox();
  res.json(result);
}
