import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../img/medibot-hero.png";

const SYMPTOMS = [
  "Fever","Cough","Headache","Sore Throat","Runny Nose","Fatigue","Nausea",
  "Vomiting","Diarrhea","Shortness of Breath","Chest Pain","Body Aches",
  "Loss of Smell","Loss of Taste","Dizziness","Rash"
];

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

      {/* ===== Symptoms (separate, distinct panel; chips wrap) ===== */}
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

      {/* ===== Analysis ===== */}
      <section id="analysis" className="analysis-block">
        <h2>Preliminary Analytics</h2>
        <div className="analysis-card">
          <div className="analysis-col">
            <h3>Likely Categories</h3>
            <ul className="bullets">
              <li>Respiratory</li>
              <li>Viral Infection</li>
              <li>Allergy</li>
            </ul>
          </div>
          <div className="analysis-col">
            <h3>Next Steps</h3>
            <ul className="bullets">
              <li>Track temperature and hydration</li>
              <li>Rest and appropriate OTC relief</li>
              <li>Urgent care if severe chest pain / SOB</li>
            </ul>
          </div>
          <div className="analysis-col">
            <h3>Confidence</h3>
            <div className="confidence-bar">
              <div className="fill" style={{ width: "72%" }} />
            </div>
            <small className="muted">This is not medical advice.</small>
          </div>
        </div>
      </section>

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
