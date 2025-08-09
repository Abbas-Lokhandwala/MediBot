import React, { useEffect, useMemo, useState } from "react";
import SymptomChip from "./SymptomChip";
import SeverityPicker from "./SeverityPicker";
import { useSymptomsStore } from "../state/useSymptomsStore";

export default function SymptomsPicker() {
  const { allSymptoms, selected, toggle, setSeverity, load } = useSymptomsStore();
  const [query, setQuery] = useState("");

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allSymptoms.filter((s) => s.toLowerCase().includes(q));
  }, [allSymptoms, query]);

  return (
    <div className="panel">
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Search symptoms..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn" onClick={() => setQuery("")}>Clear</button>
      </div>

      <div className="symptoms-grid">
        {filtered.map((s, i) => (
          <SymptomChip
            key={s}
            index={i}
            label={s}
            selected={!!selected[s]}
            onToggle={() => toggle(s)}
            rightSlot={
              selected[s] ? (
                <SeverityPicker
                  value={selected[s]?.severity || 1}
                  onChange={(lvl) => setSeverity(s, lvl)}
                />
              ) : null
            }
          />
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "var(--muted)" }}>
          Selected: <b>{Object.keys(selected).length}</b>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => useSymptomsStore.getState().clear()}>Reset</button>
        </div>
      </div>
    </div>
  );
}
