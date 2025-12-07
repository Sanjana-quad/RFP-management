// src/components/Layout.tsx
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          background: "#0f172a",
          color: "white",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "20px" }}>
          AI-Powered RFP Management
        </h1>
        <nav style={{ display: "flex", gap: "16px" }}>
          <Link to="/rfps" style={{ color: "white" }}>
            RFPs
          </Link>
          <Link to="/rfps/new" style={{ color: "white" }}>
            New RFP
          </Link>
          <Link to="/vendors" style={{ color: "white" }}>
            Vendors
          </Link>
        </nav>
      </header>
      <main style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
