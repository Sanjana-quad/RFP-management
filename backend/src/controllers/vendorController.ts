import { Request, Response } from "express";
import * as vendorService from "../services/vendorService";

export async function createVendor(req: Request, res: Response) {
  const vendor = await vendorService.createVendor(req.body);
  res.status(201).json(vendor);
}

export async function getVendors(req: Request, res: Response) {
  const vendors = await vendorService.listVendors();
  res.json(vendors);
}
