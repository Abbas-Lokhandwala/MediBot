import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SymptomsPicker from "../components/SymptomsPicker";
import { useSymptomsStore } from "../state/useSymptomsStore";
import { runDiagnosis } from "../api/model";

export default function Home() {
  const navigate = useNavigate();
  const { selected } = useSymptomsStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const payload = useMemo(() => ({
    items: Object.entries(selected).map(([name, v]) => ({
      name,
      severity: v.severity,
    })),
  }), [selected]);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      const data = await runDiagnosis(payload);
      sessionStorage.setItem(
        "medibot_result",
        JSON.stringify({ input: payload, output: data })
      );
      navigate("/results");
    } catch (e) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="hero">
        <div className="card">
          <h1>Describe how you feel. MEDIBOT does the rest.</h1>
          <p>
            Pick your symptoms and set severity (1–5). We'll generate a quick
            triage summary and possible causes.{" "}
            <Link to="/metrics">See model metrics</Link>.
          </p>
          <div className="cta">
            <a href="#symptoms" className="btn primary">
              Start Selecting
            </a>
            <Link className="btn" to="/metrics">
              Model Accuracy
            </Link>
          </div>
        </div>
      </div>

      <div id="symptoms" className="section">
        <h2>Symptoms</h2>
        <SymptomsPicker />
        {error && (
          <div style={{ color: "#ff9b9b", marginTop: 10 }}>{error}</div>
        )}
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <button
            className="btn primary"
            disabled={loading || payload.items.length === 0}
            onClick={handleSubmit}
          >
            {loading ? "Analyzing..." : "Submit for Analysis"}
          </button>
          <span style={{ color: "var(--muted)", alignSelf: "center" }}>
            {payload.items.length === 0
              ? "Select at least one symptom"
              : `${payload.items.length} selected`}
          </span>
        </div>
      </div>

      <div className="section">
        <h2>Model Accuracy</h2>
        <div className="panel">
          <p style={{ margin: 0 }}>
            We publish precision/recall, calibration, and AUROC for major symptom
            clusters. View details and caveats on the{" "}
            <Link to="/metrics">Metrics page</Link>.
          </p>
        </div>
      </div>
    </>
  );
}