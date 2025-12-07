import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getRfpComparison,
  listVendors,
  pollEmails,
  sendRfpToVendors,
} from "../api/client";
import type {
    RfpComparisonResponse,
    Vendor,
} from "../api/types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function RfpDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RfpComparisonResponse | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [polling, setPolling] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function loadRfp() {
    if (!id) return;
    try {
      setError(null);
      setLoading(true);
      const res = await getRfpComparison(id);
      setData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to load RFP");
    } finally {
      setLoading(false);
    }
  }

  async function loadVendorList() {
    try {
      setLoadingVendors(true);
      const vs = await listVendors();
      setVendors(vs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingVendors(false);
    }
  }

  useEffect(() => {
    loadRfp();
    loadVendorList();
  }, [id]);

  function toggleVendorSelection(vendorId: string) {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  }

  async function handleSendRfp() {
    if (!id || selectedVendors.length === 0) return;
    setSending(true);
    setError(null);
    setInfoMessage(null);
    try {
      await sendRfpToVendors(id, selectedVendors);
      setInfoMessage("RFP sent to selected vendors.");
    } catch (err: any) {
      setError(err?.message || "Failed to send RFP");
    } finally {
      setSending(false);
    }
  }

  async function handlePollEmails() {
    setPolling(true);
    setError(null);
    setInfoMessage(null);
    try {
      const res = await pollEmails();
      setInfoMessage(`Processed ${res.processed} new emails.`);
      await loadRfp(); // refresh proposals + recommendation
    } catch (err: any) {
      setError(err?.message || "Failed to poll emails");
    } finally {
      setPolling(false);
    }
  }

  if (loading) return <Loading />;
  if (!data || !data.rfp) return <ErrorMessage message="RFP not found" />;

  const { rfp, proposals, ai_overall_recommendation } = data;

  return (
    <div>
      <h2>{rfp.title}</h2>

      <section
        style={{
          background: "white",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>RFP Overview</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{rfp.description}</p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 8,
          }}
        >
          <div>
            <strong>Budget:</strong>{" "}
            {rfp.budget ? `${rfp.currency || ""} ${rfp.budget}` : "—"}
          </div>
          <div>
            <strong>Delivery deadline:</strong>{" "}
            {rfp.delivery_deadline
              ? new Date(rfp.delivery_deadline).toLocaleDateString()
              : "—"}
          </div>
          <div>
            <strong>Payment terms:</strong>{" "}
            {rfp.payment_terms || "—"}
          </div>
          <div>
            <strong>Warranty:</strong>{" "}
            {rfp.warranty_terms || "—"}
          </div>
        </div>
        <h4 style={{ marginTop: 16 }}>Items</h4>
        {rfp.items.length === 0 ? (
          <p>No items found.</p>
        ) : (
          <ul>
            {rfp.items.map((item) => (
              <li key={item.id}>
                {item.quantity} × {item.name}{" "}
                {item.specs_json &&
                  Object.keys(item.specs_json).length > 0 &&
                  `(${Object.entries(item.specs_json)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(", ")})`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        style={{
          background: "white",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Send RFP to Vendors</h3>
        {loadingVendors ? (
          <Loading />
        ) : vendors.length === 0 ? (
          <p>No vendors available. Add some in the Vendors page.</p>
        ) : (
          <>
            <p>Select vendors to send this RFP to:</p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxHeight: 200,
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                padding: 8,
                borderRadius: 4,
              }}
            >
              {vendors.map((v) => (
                <label key={v.id} style={{ display: "flex", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(v.id)}
                    onChange={() => toggleVendorSelection(v.id)}
                  />
                  <span>
                    {v.name} — <small>{v.email}</small>
                  </span>
                </label>
              ))}
            </div>
            <button
              type="button"
              disabled={sending || selectedVendors.length === 0}
              onClick={handleSendRfp}
              style={{
                marginTop: 12,
                padding: "8px 16px",
                borderRadius: 4,
                border: "none",
                background: "#2563eb",
                color: "white",
                cursor:
                  sending || selectedVendors.length === 0
                    ? "default"
                    : "pointer",
                opacity:
                  sending || selectedVendors.length === 0 ? 0.7 : 1,
              }}
            >
              {sending ? "Sending…" : "Send RFP to Selected Vendors"}
            </button>
          </>
        )}
      </section>

      <section
        style={{
          background: "white",
          borderRadius: 8,
          padding: 16,
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Vendor Proposals</h3>
        <div style={{ marginBottom: 12, display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={handlePollEmails}
            disabled={polling}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              background: "#0f766e",
              color: "white",
              cursor: polling ? "default" : "pointer",
              opacity: polling ? 0.7 : 1,
            }}
          >
            {polling ? "Fetching responses…" : "Fetch New Responses"}
          </button>
        </div>
        {error && <ErrorMessage message={error} />}
        {infoMessage && (
          <p style={{ color: "#16a34a", marginBottom: 12 }}>
            {infoMessage}
          </p>
        )}

        {proposals.length === 0 ? (
          <p>No proposals yet. Once vendors reply to your email, poll responses here.</p>
        ) : (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: 16,
              }}
            >
              <thead>
                <tr>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    Vendor
                  </th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    Total Price
                  </th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    Delivery (days)
                  </th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    Payment Terms
                  </th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    Warranty
                  </th>
                  <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id}>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {p.vendor?.name}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {p.total_price != null
                        ? `${p.currency || ""} ${p.total_price}`
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {p.delivery_days ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {p.payment_terms || "—"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {p.warranty_terms || "—"}
                    </td>
                    <td
                      style={{
                        padding: 8,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      {p.score_overall != null ? p.score_overall : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "grid", gap: 12 }}>
              {proposals.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    padding: 12,
                    background: "#f9fafb",
                  }}
                >
                  <strong>{p.vendor?.name}</strong>
                  <p style={{ marginTop: 4 }}>
                    <strong>AI Evaluation:</strong>{" "}
                    {p.ai_evaluation_summary || "No detailed summary."}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {ai_overall_recommendation && (
        <section
          style={{
            background: "#ecfeff",
            borderRadius: 8,
            padding: 16,
            boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>AI Recommendation</h3>
          {ai_overall_recommendation.recommended_vendor_id ? (
            <>
              <p>
                <strong>Recommended vendor:</strong>{" "}
                {
                  proposals.find(
                    (p) =>
                      p.vendor.id ===
                      ai_overall_recommendation.recommended_vendor_id
                  )?.vendor.name
                }
              </p>
              <p>
                <strong>Reason:</strong>{" "}
                {ai_overall_recommendation.reason}
              </p>
            </>
          ) : (
            <p>{ai_overall_recommendation.reason}</p>
          )}
        </section>
      )}
    </div>
  );
}
