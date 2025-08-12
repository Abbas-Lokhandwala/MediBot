import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadMedicalData, scoreDiseases } from "../lib/analyze";

export default function Results() {
  const [selected, setSelected] = useState([]);
  const [ranked, setRanked] = useState([]);
  const [meta, setMeta] = useState({ descriptions: {}, precautions: {} });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const s = JSON.parse(sessionStorage.getItem("selectedSymptoms") || "[]");
    setSelected(s);

    (async () => {
      try {
        const { diseaseSymptoms, descriptions, precautions } = await loadMedicalData();
        const scores = scoreDiseases(s, diseaseSymptoms, { orderBoost: 0.15, normalize: true });
        setRanked(scores.slice(0, 3)); // top-3 results
        setMeta({ descriptions, precautions });
      } catch (e) {
        console.error(e);
        setErr(e.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="results"><h2>Analyzing…</h2></div>;
  if (err) return <div className="results"><h2>Couldn’t analyze</h2><p className="muted">{err}</p></div>;

  const totalScore = ranked.reduce((sum, r) => sum + r.score, 0);

  return (
    <div className="results">

      <h2>Preliminary Results</h2>
      <p className="muted">Selected symptoms: {selected.join(", ") || "—"}</p>

      <div className="cards">
        {ranked.length === 0 && (
          <div className="card">
            <div className="card-title">No strong matches</div>
            <p className="muted">Try adding 1–2 more key symptoms for a better signal.</p>
          </div>
        )}

        {ranked.map((r, i) => {
          const d = r.disease;
          const desc = meta.descriptions[d] || "No description available.";
          const steps = meta.precautions[d] || [];
          const pct = totalScore > 0 ? (r.score / totalScore) * 100 : 0;

          return (
            <div className="card" key={d}>
              <div className="card-head">
                <div className="rank">{i + 1}</div>
                <div className="card-title">{d}</div>
                <div className="score">{pct.toFixed(0)}%</div>
              </div>
              <p className="desc">{desc}</p>
              {steps.length > 0 && (
                <>
                  <div className="subhead">Suggested Precautions</div>
                  <ul className="bullets">
                    {steps.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="muted" style={{ marginTop: 16 }}>
        These percentages are relative to the top results shown and are for educational use only.
      </p>
    </div>
  );
}
