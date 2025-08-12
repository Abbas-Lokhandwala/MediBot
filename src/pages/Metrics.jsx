import React, { useEffect, useState } from "react";
import datasetCsv from "../data/dataset.csv?raw";
import {
  parseCsvRaw, buildMatrices, splitTrainTest,
  trainClassProfiles, evaluate
} from "../lib/stats";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend
} from "recharts";

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);
  const [perClass, setPerClass] = useState([]);
  const [cmFull, setCmFull] = useState([]);     // full confusion matrix
  const [classes, setClasses] = useState([]);   // all class labels

  useEffect(() => {
    try {
      // 1) Parse + build
      const { rows } = parseCsvRaw(datasetCsv);
      const mats = buildMatrices(rows);
      const split = splitTrainTest(mats.X, mats.y, mats.classes, mats.classIndex, 0.2, 42);

      // 2) Train simple overlap baseline
      const { profiles } = trainClassProfiles(split.X_train, split.y_train, mats.classes);

      // 3) Evaluate
      const ev = evaluate(split.X_test, split.y_test, profiles, mats.classes, mats.classIndex);

      setSummary({
        accuracy: ev.accuracy,
        f1Macro: ev.f1Macro,
        top3: ev.top3Recall,
        nClasses: mats.classes.length,
        nFeatures: mats.vocab.length,
        nTrain: split.X_train.length,
        nTest: split.X_test.length,
        calib: ev.calib
      });
      setPerClass(ev.perClass);    // include support for later slicing
      setCmFull(ev.cm);
      setClasses(mats.classes);

      setLoading(false);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to compute analytics.");
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="analytics-page"><h1>Crunching analytics…</h1></div>;
  if (err) return <div className="analytics-page"><h1>Analytics</h1><p className="muted">{err}</p></div>;

  // Cards → turn into tidy table
  const stats = [
    ["Accuracy", `${(summary.accuracy * 100).toFixed(1)}%`],
    ["Macro F1", `${(summary.f1Macro * 100).toFixed(1)}%`],
    ["Top‑3 Recall", `${(summary.top3 * 100).toFixed(1)}%`],
    ["Classes", summary.nClasses],
    ["Symptoms (features)", summary.nFeatures],
    ["Train / Test", `${summary.nTrain} / ${summary.nTest}`],
  ];

  // Per‑class F1 (top N by support)
  const perClassTop = [...perClass]
    .sort((a, b) => b.support - a.support)
    .slice(0, 15)
    .map(r => ({ ...r, f1p: +(r.f1 * 100).toFixed(1) }));

  // Confusion matrix: top‑10 by support to keep it readable
  const topN = 10;
  const topLabels = [...perClass]
    .sort((a, b) => b.support - a.support)
    .slice(0, topN)
    .map(r => r.class);

  const topIdx = topLabels.map(l => classes.indexOf(l));
  const cmTop = topIdx.map(i =>
    topIdx.map(j => cmFull[i][j])
  );
  const cmTopNorm = cmTop.map(row => {
    const s = row.reduce((a, b) => a + b, 0) || 1;
    return row.map(v => v / s);
  });

  // helper to map 0..1 → rgba blue
  const heat = (v) => `rgba(92,169,251, ${Math.min(0.85, v + 0.08)})`;

  return (
    <div className="analytics-page">
      <h1>Model Analytics</h1>
      <p className="muted">
        Below you’ll find a transparent look at how our baseline model performs on your dataset. We compute
        everything in‑browser: split the data, build a simple symptom‑overlap classifier, and report standard
        metrics. This gives you a grounded starting point before swapping in a stronger model (e.g., TF.js softmax or a calibrated multi‑class LR).
      </p>

      {/* Stats table */}
      <section className="stat-table-wrap">
        <table className="stat-table">
          <tbody>
            {stats.map(([k, v]) => (
              <tr key={k}>
                <td className="k">{k}</td>
                <td className="v">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Per‑class F1 */}
      <section className="chart-section">
        <h2>Per‑Class F1 (Top 15 by support)</h2>
        <p className="muted">F1 balances precision and recall. Higher is better. Hover for exact values.</p>
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer>
            <BarChart data={perClassTop} layout="vertical" margin={{ left: 120, right: 16, top: 8, bottom: 8 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="class" width={260} />
              <Tooltip formatter={(v) => `${v}%`} labelStyle={{ color: "var(--ink)" }} />
              <Bar dataKey="f1p" fill="#5CA9FB" radius={[4,4,4,4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Calibration */}
      <section className="chart-section">
        <h2>Calibration</h2>
        <p className="muted">
          Calibration compares the model’s confidence to how often it’s actually correct. A perfectly
          calibrated model follows the diagonal (confidence ≈ accuracy).
        </p>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={summary.calib}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="meanPred" tickFormatter={(v)=> (v*100).toFixed(0) + '%'} />
              <YAxis domain={[0, 1]} tickFormatter={(v)=> (v*100).toFixed(0) + '%'} />
              <Tooltip formatter={(v)=> (v*100).toFixed(0) + '%'} />
              <Legend />
              <Line type="monotone" dataKey="fracPos" name="Fraction Positive" stroke="#5CA9FB" strokeWidth={3} dot />
              <Line type="monotone" dataKey="meanPred" name="Mean Predicted" stroke="#69F0AE" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Confusion Matrix (Top‑10 by support) */}
      <section className="chart-section">
        <h2>Confusion Matrix (Top 10 by support)</h2>
        <p className="muted">
          Each row is a true diagnosis; columns are predicted. Cells are row‑normalized (percent of that class).
          A strong diagonal near 100% means the classifier rarely confuses these diagnoses on this dataset.
          If you see 100% everywhere on the diagonal, it usually means the dataset is **highly separable**
          (many diseases have unique symptom sets) — not that the model is “magic”. That’s normal for toy
          symptom→disease datasets.
        </p>

        <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--line)" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ padding: "6px 8px", textAlign: "left" }}>True \ Pred</th>
                {topLabels.map(l => (
                  <th key={l} style={{ padding: "6px 8px", textAlign: "left", whiteSpace: "nowrap" }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cmTopNorm.map((row, i) => (
                <tr key={i}>
                  <th style={{ padding: "6px 8px", textAlign: "left", whiteSpace: "nowrap" }}>{topLabels[i]}</th>
                  {row.map((v, j) => (
                    <td key={j} style={{
                      padding: 6,
                      background: heat(v),
                      color: v > 0.5 ? "#081019" : "var(--ink)"
                    }}>
                      {(v*100).toFixed(0)}%
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="note">
        <h3>Takeaways</h3>
        <ul>
          <li>
            Scores look high because the dataset is very clean and symptoms often uniquely map to a diagnosis.
            For more realistic estimates, try holdout conditions, noise injection, and cross‑dataset testing.
          </li>
          <li>
            You can swap the overlap scorer for a TF.js softmax model without changing this page’s structure.
          </li>
        </ul>
      </section>
    </div>
  );
}
