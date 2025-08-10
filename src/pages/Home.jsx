import React, { useState } from "react";
import SymptomsPicker from "../components/SymptomsPicker";

const SYMPTOMS = [
  "Fever","Cough","Headache","Sore Throat","Runny Nose","Fatigue","Nausea",
  "Vomiting","Diarrhea","Shortness of Breath","Chest Pain","Body Aches",
  "Loss of Smell","Loss of Taste","Dizziness","Rash"
];

export default function Home() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // selectedSymptoms is an ordered array, e.g. ["Fever","Cough","Rash"]
    console.log(selectedSymptoms);
    // route to results or call your model here
  };

  return (
    <form onSubmit={handleSubmit} className="symptom-form">
      <h2>Select your symptoms</h2>
      <SymptomsPicker
        options={SYMPTOMS}
        value={selectedSymptoms}
        onChange={setSelectedSymptoms}
      />
      <div className="form-row">
        <div className="selected-count">Selected: {selectedSymptoms.length}</div>
        <button className="primary-btn">Continue</button>
      </div>
    </form>
  );
}
