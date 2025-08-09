import React from "react";

export default function SeverityPicker({ value = 1, onChange, onClickContainer }) {
  const levels = [1, 2, 3, 4, 5];

  return (
    <div
      className="severity"
      onClick={(e) => {
        e.stopPropagation();
        onClickContainer?.();
      }}
    >
      {levels.map((l) => (
        <button
          key={l}
          type="button"
          className={`sev-dot ${l === value ? "active" : ""}`}
          onClick={() => onChange(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
