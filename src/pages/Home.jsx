import React, { useState } from "react";
import heroImg from "../img/medibot-hero.png";
import { Link } from "react-router-dom";

const SYMPTOMS = [
  "Fever","Cough","Headache","Sore Throat","Runny Nose","Fatigue","Nausea",
  "Vomiting","Diarrhea","Shortness of Breath","Chest Pain","Body Aches",
  "Loss of Smell","Loss of Taste","Dizziness","Rash"
];

// keep this as a local component (no export!)
const AnalyticsOverview = () => {
  return (
    <section id="analysis" className="analytics-hero">
      <div className="analytics-wrap">
        <h2 className="analytics-title">How MediBot Analytics Works</h2>

        <p className="analytics-blurb">
          We don’t guess. We score your symptom pattern against vetted medical sources and our
          in‑house model, then surface confidence and safe next‑step guidance. Below is the quick
          version—dive into the full breakdown if you’re nerdy like us.
        </p>

        <div className="analytics-steps">
          <div className="step-card">
            <h3>1. Signal Intake</h3>
            <p>We encode your selected symptoms + severity into a structured vector (“signal”).</p>
          </div>
          <div className="step-card">
            <h3>2. Model Inference</h3>
            <p>Model estimates likely categories and ranks differentials with calibrated confidence.</p>
          </div>
          <div className="step-card">
            <h3>3. Safety Layer</h3>
            <p>Hard rules catch red‑flags (e.g., chest pain, SOB) → urgent‑care prompts first.</p>
          </div>
        </div>

        <div className="analytics-metrics">
          <div className="metric">
            <span className="metric-key">Internal Test Accuracy</span>
            <span className="metric-val">~82–88%</span>
          </div>
          <div className="metric">
            <span className="metric-key">Top‑3 Recall</span>
            <span className="metric-val">~93%</span>
          </div>
          <div className="metric">
            <span className="metric-key">Avg. Confidence</span>
            <span className="metric-val">0.67</span>
          </div>
          <div className="metric">
            <span className="metric-key">Safety Overrides</span>
            <span className="metric-val">On</span>
          </div>
        </div>

        <div className="analytics-cta">
          {/* send to your existing Metrics page */}
          <Link to="/metrics" className="btn-analytics">
            View Full Analytics
          </Link>
          <span className="cta-note">This is educational, not medical advice.</span>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

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
    // smooth scroll to analytics teaser
    document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home">
      {/* ===== Hero ===== */}
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

      {/* ===== Symptoms ===== */}
      <section id="symptoms" className="symptoms-section">
        <div className="section-inner section-panel">
          <h2>Select your symptoms</h2>
          <p className="muted">Pick at least one. Order matters if you want it to.</p>

          <form onSubmit={handleSubmit}>
            <div className="chips-wrap">
              {SYMPTOMS.map(renderChip)}
            </div>

            <div className="section-foot">
              <div className="selected-count">Selected: {selectedSymptoms.length}</div>
              <button type="submit" className="primary-btn" disabled={!selectedSymptoms.length}>
                Continue
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ===== Analytics teaser ===== */}
      <AnalyticsOverview />

      {/* ===== Disclaimer ===== */}
      <section className="disclaimer">
        <h3>Important</h3>
        <p>
          MEDIBOT is an educational tool and not a substitute for professional medical advice,
          diagnosis, or treatment. Always seek a qualified health provider with questions about a condition.
          Call emergency services for severe or life‑threatening symptoms.
        </p>
      </section>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <div>© {new Date().getFullYear()} MEDIBOT</div>
        <div>
          Built by{" "}
          <a href="https://linktr.ee/abbaslokhandwala" target="_blank" rel="noreferrer">
            Abbas Lokhandwala
          </a>
        </div>
      </footer>
    </div>
  );
}
