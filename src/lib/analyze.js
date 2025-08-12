// src/lib/analyze.js
import diseaseSymptoms from "../data/disease_symptoms.json";
import descriptions from "../data/descriptions.json";
import precautions from "../data/precautions.json";

export async function loadMedicalData() {
  // keep API the same for the rest of your code
  return { diseaseSymptoms, descriptions, precautions };
}

export function scoreDiseases(selected, diseaseSymptoms, { orderBoost = 0.1, normalize = true } = {}) {
  const picks = selected.map(s => s.trim().toLowerCase());
  const index = new Map(picks.map((s, i) => [s, i]));
  const results = [];

  for (const [disease, symptoms] of Object.entries(diseaseSymptoms)) {
    let score = 0;
    for (const s of symptoms) {
      if (index.has(s)) {
        const pos = index.get(s);
        const w = 1 + Math.max(0, (picks.length - pos - 1)) * orderBoost;
        score += w;
      }
    }
    if (normalize && symptoms.length) score /= symptoms.length;
    if (score > 0) results.push({ disease, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
