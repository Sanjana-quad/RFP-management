import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRfpFromText } from "../api/client";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function RfpCreatePage() {
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const exampleText =
    "I need to procure laptops and monitors for our new office. " +
    "Budget is $50,000 total. Need delivery within 30 days. " +
    "We need 20 laptops with 16GB RAM and 15 monitors 27-inch. " +
    "Payment terms should be net 30, and we need at least 1 year warranty.";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const rfp = await createRfpFromText(description);
      navigate(`/rfps/${rfp.id}`);
    } catch (err: any) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create RFP. If this is an AI quota issue, try again later or use mock mode.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2>Create RFP from Natural Language</h2>
      <p style={{ maxWidth: 700, marginBottom: 16 }}>
        Describe what you want to buy in plain English. The system will use AI
        to convert it into a structured RFP with items, budget, delivery, and
        terms.
      </p>

      <button
        type="button"
        style={{
          marginBottom: 12,
          padding: "4px 8px",
          borderRadius: 4,
          border: "1px solid #cbd5f5",
          background: "#080750ff",
          cursor: "pointer",
        }}
        onClick={() => setDescription(exampleText)}
      >
        Paste example text
      </button>

      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={10}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 4,
            border: "1px solid #cbd5e1",
            marginBottom: 12,
            fontFamily: "inherit",
          }}
          placeholder="Describe your RFP..."
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            disabled={submitting || !description.trim()}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              background: "#2563eb",
              color: "white",
              cursor: submitting ? "default" : "pointer",
              opacity: submitting || !description.trim() ? 0.7 : 1,
            }}
          >
            {submitting ? "Creating RFP…" : "Generate Structured RFP"}
          </button>
          {submitting && <Loading />}
        </div>
        {error && <ErrorMessage message={error} />}
      </form>
    </div>
  );
}
