import React, { useState } from "react";
import heroImg from "../img/medibot-hero.png";
import { Link, useNavigate } from "react-router-dom";

const SYMPTOMS = [
  "Fever","Cough","Headache","Sore Throat","Runny Nose","Fatigue","Nausea",
  "Vomiting","Diarrhea","Shortness of Breath","Chest Pain","Body Aches",
  "Loss of Smell","Loss of Taste","Dizziness","Rash"
];


const AnalyticsOverview = () => {
  return (
    <section id="analysis" className="analytics-hero">
      <div className="analytics-wrap">
        <h2 className="analytics-title">How MediBot Analytics Works</h2>

        <p className="analytics-blurb">
          MediBot uses a multi‑stage pipeline to turn your selected symptoms into actionable insight.
          We encode your inputs, score them against a learned symptom profile, and apply a safety layer
          to surface urgent red‑flags first. The full Analytics page shows browser‑computed metrics,
          calibration, and dataset insights.
        </p>

        <div className="analytics-steps">
          <div className="step-card">
            <h3>1. Signal Intake</h3>
            <p>
              Your symptoms (and order/severity if provided) are converted into a structured vector
              the model can understand.
            </p>
          </div>
          <div className="step-card">
            <h3>2. Model Inference</h3>
            <p>
              We compare that signal to learned symptom profiles to estimate likely conditions and rank
              differentials with a confidence score.
            </p>
          </div>
          <div className="step-card">
            <h3>3. Safety Layer</h3>
            <p>
              Hard rules catch red‑flags (e.g., severe chest pain, sudden neuro changes, shortness of breath)
              and elevate urgent‑care guidance.
            </p>
          </div>
        </div>

        {/* Updated, real metrics from your current Analytics run */}
        <div className="analytics-metrics">
          <div className="metric">
            <span className="metric-key">Accuracy</span>
            <span className="metric-val">97.1%</span>
          </div>
          <div className="metric">
            <span className="metric-key">Macro‑F1</span>
            <span className="metric-val">96.7%</span>
          </div>
          <div className="metric">
            <span className="metric-key">Top‑3 Recall</span>
            <span className="metric-val">100%</span>
          </div>
          <div className="metric">
            <span className="metric-key">Classes</span>
            <span className="metric-val">41</span>
          </div>
        </div>

        <div className="analytics-cta">
          <Link to="/metrics" className="btn-analytics">View Full Analytics</Link>
          <span className="cta-note">
            Educational use only. Not a substitute for professional medical advice.
          </span>
        </div>
      </div>
    </section>
  );
};


export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const navigate = useNavigate();

  const toggle = (sym) => {
    const i = selectedSymptoms.indexOf(sym);
    if (i === -1) setSelectedSymptoms([...selectedSymptoms, sym]);
    else setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
  };

  const renderChip = (sym) => {
    const idx = selectedSymptoms.indexOf(sym);
    const selected = idx !== -1;
    return (
      <button
        key={sym}
        type="button"
        className={`chip ${selected ? "chip--selected" : ""}`}
        onClick={() => toggle(sym)}
        aria-pressed={selected}
      >
        {selected && <span className="chip-badge">{idx + 1}</span>}
        <span className="chip-label">{sym}</span>
      </button>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSymptoms.length) return;
    sessionStorage.setItem("selectedSymptoms", JSON.stringify(selectedSymptoms));
    navigate("/results"); // <-- go to results page
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero hero-split">
        <div className="hero-copy">
          <div className="eyebrow">NOW OPEN • YOUR AI CHECKUP</div>
          <h1>
            HOW WILL <span className="accent">YOUR</span> HEALTH
            <br /> FEEL <span className="accent">BETTER</span> TODAY?
          </h1>
          <p className="lead">
            Describe what you’re feeling in plain language. We’ll analyze symptoms,
            surface likely conditions, and suggest next steps.
          </p>
          <button
            className="primary-btn"
            onClick={() =>
              document.getElementById("symptoms")?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Start with Symptoms
          </button>
        </div>

        <div className="hero-card">
          <img src={heroImg} alt="Telehealth" />
        </div>
      </section>

      {/* Symptoms */}
      <section id="symptoms" className="symptoms-section">
        <div className="section-inner section-panel">
          <h2>Select your symptoms</h2>
          <p className="muted">Pick at least one. Order matters if you want it to.</p>

          <form onSubmit={handleSubmit}>
            <div className="chips-wrap">{SYMPTOMS.map(renderChip)}</div>

            <div className="section-foot">
              <div className="selected-count">Selected: {selectedSymptoms.length}</div>
              <button type="submit" className="primary-btn" disabled={!selectedSymptoms.length}>
                Continue
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Analytics teaser */}
      <AnalyticsOverview />

      {/* Disclaimer */}
      <section className="disclaimer">
        <h3>⚠️ Important Safety Notice</h3>
        <p>
          MediBot is an <strong>educational tool only</strong> and should <strong>not</strong> be used as a
          substitute for professional medical advice, diagnosis, or treatment. Always seek the guidance
          of a qualified healthcare provider for questions about your health or a medical condition.
          🚨 If you are experiencing severe, sudden, or life‑threatening symptoms, call your local
          emergency services immediately.
        </p>
      </section>

      {/* Footer (centered, single line) */}
      <footer className="footer">
        <span>© {new Date().getFullYear()} MEDIBOT</span>
        <span>•</span>
        <span>
          Built by{" "}
          <a href="https://linktr.ee/abbaslokhandwala" target="_blank" rel="noreferrer">
            Abbas Lokhandwala
          </a>
        </span>
      </footer>
    </div>
  );
}
