// src/api/types.ts

export interface RfpItem {
  id: string;
  name: string;
  quantity: number;
  specs_json: Record<string, any>;
}

export interface Rfp {
  id: string;
  title: string;
  description: string;
  budget: number | null;
  currency: string | null;
  delivery_deadline: string | null;
  payment_terms: string | null;
  warranty_terms: string | null;
  status: string;
  items: RfpItem[];
}

export interface Vendor {
  id: string;
  name: string;
  contact_name: string | null;
  email: string;
  phone: string | null;
}

export interface Proposal {
  id: string;
  vendor: Vendor;
  total_price: number | null;
  currency: string | null;
  delivery_days: number | null;
  payment_terms: string | null;
  warranty_terms: string | null;
  score_overall: number | null;
  score_price: number | null;
  score_terms: number | null;
  score_risk: number | null;
  ai_evaluation_summary: string | null;
  notes?: string | null;
}

export interface RfpComparisonResponse {
  rfpId: string;
  rfp: Rfp;
  proposals: Proposal[];
  ai_overall_recommendation?: {
    recommended_vendor_id: string | null;
    reason: string;
  };
}
