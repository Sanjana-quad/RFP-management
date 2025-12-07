import { type FormEvent, useEffect, useState } from "react";
import { createVendor, listVendors } from "../api/client";
import type { Vendor } from "../api/types";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function VendorListPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadVendors() {
    try {
      setError(null);
      setLoading(true);
      const data = await listVendors();
      setVendors(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVendors();
  }, []);

  async function handleCreateVendor(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createVendor({
        name,
        contact_name: contactName || null,
        email,
        phone: phone || null,
      } as any);
      setName("");
      setContactName("");
      setEmail("");
      setPhone("");
      await loadVendors();
    } catch (err: any) {
      setError(err?.message || "Failed to create vendor");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <h2>Vendors</h2>

      <section
        style={{
          marginBottom: 24,
          padding: 40,
          background: "lightpink",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
          maxWidth: 600,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Add Vendor</h3>
        <form onSubmit={handleCreateVendor}>
          <div style={{ marginBottom: 8 }}>
            <label>
              Name*
              <br />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Contact Name
              <br />
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Email*
              <br />
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label>
              Phone
              <br />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 4,
                  border: "1px solid #cbd5e1",
                }}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "8px 16px",
              borderRadius: 4,
              border: "none",
              background: "#16a34a",
              color: "white",
              cursor: creating ? "default" : "pointer",
              opacity: creating ? 0.7 : 1,
            }}
          >
            {creating ? "Adding…" : "Add Vendor"}
          </button>
          {error && <ErrorMessage message={error} />}
        </form>
      </section>

      <section>
        <h3>Vendor List</h3>
        {loading ? (
          <Loading />
        ) : vendors.length === 0 ? (
          <p>No vendors yet. Add one above.</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "peachpuff",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  Name
                </th>
                <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  Contact
                </th>
                <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  Email
                </th>
                <th style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                  Phone
                </th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    {v.name}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    {v.contact_name || "—"}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    {v.email}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #e2e8f0" }}>
                    {v.phone || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
