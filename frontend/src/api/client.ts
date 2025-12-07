// src/api/client.ts
import axios from "axios";
import type {
    Rfp,
    RfpComparisonResponse,
    Vendor,
} from "./types";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL,
});

// ---- RFPs ----

export async function createRfpFromText(description: string): Promise<Rfp> {
  const res = await api.post("/rfps/from-text", { description });
  return res.data.rfp;
}

export async function listRfps(): Promise<Rfp[]> {
  const res = await api.get("/rfps");
  return res.data;
}

export async function getRfpComparison(
  rfpId: string
): Promise<RfpComparisonResponse> {
  const res = await api.get(`/rfps/${rfpId}/comparison`);
  return res.data;
}

// ---- Vendors ----

export async function listVendors(): Promise<Vendor[]> {
  const res = await api.get("/vendors");
  return res.data;
}

export async function createVendor(
  payload: Omit<Vendor, "id">
): Promise<Vendor> {
  const res = await api.post("/vendors", payload);
  return res.data;
}

// ---- RFP-Vendor actions ----

export async function sendRfpToVendors(
  rfpId: string,
  vendorIds: string[]
): Promise<void> {
  await api.post(`/rfps/${rfpId}/send`, { vendorIds });
}

// ---- Email / proposals polling ----

export async function pollEmails(): Promise<{ processed: number }> {
  const res = await api.post("/emails/poll");
  return res.data;
}
