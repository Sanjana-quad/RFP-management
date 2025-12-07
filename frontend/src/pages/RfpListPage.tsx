// src/pages/RfpListPage.tsx
import { useEffect, useState } from "react";
import type { Rfp } from "../api/types";
import { listRfps } from "../api/client";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { Link } from "react-router-dom";

export default function RfpListPage() {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await listRfps();
        setRfps(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load RFPs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2>RFPs</h2>
        <Link to="/rfps/new">+ Create New RFP</Link>
      </div>

      {rfps.length === 0 ? (
        <p>No RFPs yet. Create one from natural language.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #e2e8f0", padding: 8 }}>
                Title
              </th>
              <th style={{ borderBottom: "1px solid #e2e8f0", padding: 8 }}>
                Budget
              </th>
              <th style={{ borderBottom: "1px solid #e2e8f0", padding: 8 }}>
                Status
              </th>
              <th style={{ borderBottom: "1px solid #e2e8f0", padding: 8 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rfps.map((rfp) => (
              <tr key={rfp.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  {rfp.title}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  {rfp.budget
                    ? `${rfp.currency || ""} ${rfp.budget}`
                    : "—"}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  {rfp.status}
                </td>
                <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  <Link to={`/rfps/${rfp.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
