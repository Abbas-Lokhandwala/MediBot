import React from "react";

export default function Metrics() {
  const rows = [
    { cluster: "Respiratory", precision: 0.83, recall: 0.78, auroc: 0.89 },
    { cluster: "Gastrointestinal", precision: 0.79, recall: 0.74, auroc: 0.86 },
    { cluster: "Musculoskeletal", precision: 0.81, recall: 0.76, auroc: 0.88 },
  ];

  return (
    <div className="section">
      <h2>Model Metrics (Preview)</h2>
      <div className="panel">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Cluster</th>
                <th style={th}>Precision</th>
                <th style={th}>Recall</th>
                <th style={th}>AUROC</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cluster}>
                  <td style={td}>{r.cluster}</td>
                  <td style={td}>{r.precision}</td>
                  <td style={td}>{r.recall}</td>
                  <td style={td}>{r.auroc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: "var(--muted)" }}>
          Note: Demo values. Replace with your evaluation outputs.
        </p>
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 8px",
  borderBottom: "1px solid var(--border)",
  color: "var(--muted)",
};
const td = { padding: "10px 8px", borderBottom: "1px dashed var(--border)" };
