// src/state/useSymptomsStore.js
import { create } from "zustand";

const DEFAULT_SYMPTOMS = [
  "Fever", "Cough", "Headache", "Fatigue", "Sore throat", "Runny nose",
  "Shortness of breath", "Chest pain", "Nausea", "Vomiting", "Diarrhea",
  "Abdominal pain", "Back pain", "Muscle aches", "Joint pain", "Rash",
  "Dizziness", "Loss of taste", "Loss of smell", "Chills"
];

export const useSymptomsStore = create((set, get) => ({
  allSymptoms: DEFAULT_SYMPTOMS,
  selected: {}, // { symptom: { severity: 1..5 } }

  toggle(symptom) {
    const cur = { ...get().selected };
    if (cur[symptom]) {
      delete cur[symptom];
    } else {
      cur[symptom] = { severity: 1 };
    }
    set({ selected: cur });
    localStorage.setItem("medibot_selected", JSON.stringify(cur));
  },

  setSeverity(symptom, severity) {
    const cur = { ...get().selected };
    if (!cur[symptom]) {
      cur[symptom] = { severity };
    } else {
      cur[symptom].severity = severity;
    }
    set({ selected: cur });
    localStorage.setItem("medibot_selected", JSON.stringify(cur));
  },

  load() {
    try {
      const raw = localStorage.getItem("medibot_selected");
      if (raw) set({ selected: JSON.parse(raw) });
    } catch {}
  },

  clear() {
    set({ selected: {} });
    localStorage.removeItem("medibot_selected");
  }
}));
