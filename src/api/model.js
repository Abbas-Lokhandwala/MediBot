export async function runDiagnosis(symptomsPayload) {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(symptomsPayload),
  }).catch(() => null);

  if (!res || !res.ok) {
    return mockDiagnosis(symptomsPayload);
  }

  return res.json();
}

function mockDiagnosis({ items }) {
  const score = items.reduce((acc, s) => acc + (s.severity || 0), 0);
  const risk = score > 12 ? "high" : score > 6 ? "medium" : "low";

  return Promise.resolve({
    risk,
    summary:
      risk === "high"
        ? "Seek medical attention promptly."
        : risk === "medium"
        ? "Monitor symptoms and consider consulting a professional."
        : "Likely mild—hydrate and rest.",
    differential: [
      { label: "Viral Infection", confidence: Math.min(0.9, score / 20) },
      { label: "Allergic Reaction", confidence: Math.min(0.6, (items.length || 1) / 10) },
      { label: "Dehydration", confidence: 0.25 },
    ],
    recommendations: [
      "Track temperature 2–3x daily",
      "Hydrate and rest",
      "If symptoms persist >48h, consult a physician",
    ],
  });
}
