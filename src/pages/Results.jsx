// src/pages/Results.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("medibot_result");
      if (!raw) return;
      setData(JSON.parse(raw));
    } catch {}
  }, []);

  const badgeClass = useMemo(() => {
    const risk = data?.output?.risk;
    if (risk === "high") return "badge err";
    if (risk === "medium") return "badge warn";
    return "badge ok";
  }, [data]);

  if (!data) {
    return (
      <div className="section">
        <div className="panel">
          <p>No results yet. Go back and submit your symptoms.</p>
          <Link className="btn" to="/">Back to Home</Link>
        </div>
      </div>
    );
  }

  const { input, output } = data;

  return (
    <div className="section">
      <h2>Preliminary Triage</h2>
      <div className="result-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span className={badgeClass}>{output.risk?.toUpperCase() || "LOW"} RISK</span>
          <span style={{ color: "var(--muted)" }}>
            This is not medical advice. Consult a professional.
          </span>
        </div>

        <p style={{ marginTop: 0 }}>{output.summary}</p>

        <h3>Symptoms Submitted</h3>
        {input.items.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>None</p>
        ) : (
          <div>
            {input.items.map((s) => (
              <div className="result-row" key={s.name}>
                <div style={{ color: "var(--muted)" }}>{s.name}</div>
                <div>Severity: {s.severity}/5</div>
              </div>
            ))}
          </div>
        )}

        <h3>Possible Causes (Differential)</h3>
        <div>
          {output.differential?.map((d) => (
            <div className="result-row" key={d.label}>
              <div style={{ color: "var(--muted)" }}>{d.label}</div>
              <div>Confidence: {(d.confidence * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>

        <h3>Recommendations</h3>
        <ul>
          {output.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
        </ul>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Link className="btn" to="/">Edit Symptoms</Link>
          <button
            className="btn"
            onClick={() => {
              sessionStorage.removeItem("medibot_result");
              navigate("/");
            }}
          >
            New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
