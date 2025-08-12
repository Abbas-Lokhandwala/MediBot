import React, { useEffect, useState } from "react";
import datasetCsv from "../data/dataset.csv?raw";
import {
  parseCsvRaw, buildMatrices, splitTrainTest,
  trainClassProfiles, evaluate
} from "../lib/stats";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line
} from "recharts";

export default function Metrics() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);
  const [topSymptoms, setTopSymptoms] = useState([]);
  const [classDist, setClassDist] = useState([]);

  useEffect(() => {
    try {
      // Parse CSV & build matrices
      const { rows } = parseCsvRaw(datasetCsv);
      const mats = buildMatrices(rows);

      // Train simple overlap baseline & evaluate (for summary + calibration only)
      const split = splitTrainTest(mats.X, mats.y, mats.classes, mats.classIndex, 0.2, 42);
      const { profiles } = trainClassProfiles(split.X_train, split.y_train, mats.classes);
      const ev = evaluate(split.X_test, split.y_test, profiles, mats.classes, mats.classIndex);

      // Class distribution (for pie)
      const classCounts = new Map(mats.classes.map(c => [c, 0]));
      mats.y.forEach(lbl => classCounts.set(lbl, (classCounts.get(lbl) || 0) + 1));
      const classDistData = [...classCounts.entries()]
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Symptom frequency (for bar)
      const symCounts = new Map();
      mats.symptomCols.forEach(() => {});
      rows.forEach(r => {
        mats.symptomCols.forEach(c => {
          const s = r[c];
          if (s && s !== "nan") symCounts.set(s, (symCounts.get(s) || 0) + 1);
        });
      });
      const topSym = [...symCounts.entries()]
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

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
      setClassDist(classDistData);
      setTopSymptoms(topSym);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setErr(e.message || "Failed to compute analytics.");
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="analytics-page"><h1>Crunching analytics…</h1></div>;
  if (err) return <div className="analytics-page"><h1>Analytics</h1><p className="muted">{err}</p></div>;

  const stats = [
    ["Accuracy", `${(summary.accuracy * 100).toFixed(1)}%`],
    ["Macro F1", `${(summary.f1Macro * 100).toFixed(1)}%`],
    ["Top‑3 Recall", `${(summary.top3 * 100).toFixed(1)}%`],
    ["Classes", summary.nClasses],
    ["Symptoms (features)", summary.nFeatures],
    ["Train / Test", `${summary.nTrain} / ${summary.nTest}`],
  ];

  const COLORS = [
    "#5CA9FB", "#69F0AE", "#FFCA28", "#FF8A65", "#BA68C8",
    "#4DB6AC", "#AED581", "#90CAF9", "#F48FB1", "#FFD54F",
  ];

  return (
    <div className="analytics-page">
      <h1>Model Analytics</h1>
      <p className="muted">
        We compute these analytics directly in your browser from <code>dataset.csv</code>, using a transparent
        overlap‑based baseline. Below: a readable summary table, calibration (confidence vs. reality), and two
        dataset insights class distribution and the most common symptoms.
      </p>

      {/* Summary table */}
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
        <p className="muted" style={{ marginTop: 8 }}>
          <strong>Accuracy</strong> is overall correctness; <strong>Macro‑F1</strong> balances precision and recall across classes;
          <strong> Top‑3 Recall</strong> checks if the true diagnosis shows up anywhere in the model’s top three, a useful UX proxy.
        </p>
      </section>

      {/* Calibration */}
      <section className="chart-section">
        <h2>Calibration</h2>
        <p className="muted">
          A well‑calibrated model’s confidence should match its actual accuracy (points near the diagonal).
          Over‑confident models plot above the diagonal; under‑confident below.
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

      {/* Class distribution */}
      <section className="chart-section">
        <h2>Dataset Distribution (Diagnoses)</h2>
        <p className="muted">
          How frequently each diagnosis appears. If a few classes dominate, a model can look strong while over‑fitting
          to those common conditions. Use balanced splits or weighting when you move to a stronger model.
        </p>
        <div style={{ width: "100%", height: 380 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={classDist.slice(0, 12)}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={130}
                paddingAngle={1}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {classDist.slice(0, 12).map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {classDist.length > 12 && (
          <p className="muted" style={{ marginTop: 8 }}>
            Showing top 12 classes for readability. The remaining long‑tail classes are less frequent.
          </p>
        )}
      </section>

      {/* Top symptoms */}
      <section className="chart-section">
        <h2>Top Symptoms by Frequency</h2>
        <p className="muted">
          The most common symptoms across all cases. This informs UI design (surface common symptoms first) and helps
          explain what the model “sees” most often.
        </p>
        <div style={{ width: "100%", height: 500 }}>
          <ResponsiveContainer>
            <BarChart
              data={topSymptoms}
              layout="vertical"
              margin={{ left: 180, right: 16, top: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="symptom" width={320} />
              <Tooltip />
              <Bar dataKey="count" fill="#5CA9FB" radius={[4,4,4,4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Takeaways */}
      <section className="note">
        <h3>Key Takeaways</h3>
        <ul>
          <li>
            High scores on clean, separable datasets don’t guarantee real‑world performance. Validate with tougher,
            noisier inputs and cross‑dataset tests.
          </li>
          <li>
            Class imbalance (dataset distribution) can bias results. Consider balanced splits or class‑weighted
            loss for stronger models.
          </li>
          <li>
            Common symptoms should be quick to select; rare ones must be searchable. Use the Top Symptoms chart to
            guide your picker UX.
          </li>
          <li>
            Next steps: swap the overlap baseline for a TF.js softmax, add severity/temporal weighting, and explore
            robustness (drop/misspell symptoms) to measure degradation.
          </li>
        </ul>
      </section>
    </div>
  );
}
