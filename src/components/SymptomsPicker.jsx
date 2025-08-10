import React from "react";

export default function SymptomsPicker({ options = [], value = [], onChange }) {
  const toggle = (sym) => {
    const i = value.indexOf(sym);
    if (i === -1) onChange([...value, sym]);            // add
    else onChange(value.filter((s) => s !== sym));       // remove + reindex
  };

  return (
    <div className="chips-grid" role="group" aria-label="Select symptoms">
      {options.map((sym) => {
        const idx = value.indexOf(sym);
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
      })}
    </div>
  );
}
