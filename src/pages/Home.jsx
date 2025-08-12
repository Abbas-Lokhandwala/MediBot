import React, { useState } from "react";
import heroImg from "../img/medibot-hero.png";
import { Link, useNavigate } from "react-router-dom";

const SYMPTOMS = [
  "Fever","Cough","Headache","Sore Throat","Runny Nose","Fatigue","Nausea",
  "Vomiting","Diarrhea","Shortness of Breath","Chest Pain","Body Aches",
  "Loss of Smell","Loss of Taste","Dizziness","Rash"
];

/* -------- Analytics teaser (local component) -------- */
const AnalyticsOverview = () => {
  return (
    <section id="analysis" className="analytics-hero">
      <div className="analytics-wrap">
        <h2 className="analytics-title">How MediBot Analytics Works</h2>

        <p className="analytics-blurb">
          MediBot uses a multi‑stage analysis pipeline to transform your reported symptoms into
          actionable insights. Our AI combines structured medical datasets, clinical guidelines, and
          probabilistic inference to suggest possible categories, rank likely causes, and flag urgent
          warning signs. Every step is designed for transparency, accuracy, and safety.
        </p>

        <div className="analytics-steps">
          <div className="step-card">
            <h3>1. Signal Intake</h3>
            <p>
              We collect the symptoms you’ve selected along with their severity and order and
              convert them into a structured “signal” our model can interpret. This captures not just
              what you feel, but how intensely and in what sequence.
            </p>
          </div>
          <div className="step-card">
            <h3>2. Model Inference</h3>
            <p>
              Using this signal, MediBot applies a fine‑tuned medical classification model trained on
              verified health literature, anonymized patient data, and diagnostic guidelines. It estimates
              probabilities for multiple possible conditions, ranks them, and assigns a confidence score.
            </p>
          </div>
          <div className="step-card">
            <h3>3. Safety Layer</h3>
            <p>
              Before results are shown, a safety layer checks for red‑flag symptoms (e.g., severe chest
              pain, sudden neurological changes, shortness of breath). If detected, urgent‑care prompts
              override all other outputs.
            </p>
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
          <Link to="/metrics" className="btn-analytics">View Full Analytics</Link>
          <span className="cta-note">
            This tool is for educational purposes only and is not a substitute for professional medical advice.
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
