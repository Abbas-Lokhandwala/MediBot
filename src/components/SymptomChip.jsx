import React from "react";

export default function SymptomChip({ index, label, selected, onToggle, rightSlot }) {
  return (
    <div
      className={`chip ${selected ? "selected" : ""}`}
      onClick={onToggle}
    >
      <span>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {rightSlot}
        <span className="num">{index + 1}</span>
      </div>
    </div>
  );
}
