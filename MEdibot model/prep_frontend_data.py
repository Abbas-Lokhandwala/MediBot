# prep_frontend_data.py
import pandas as pd
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
PUBLIC_DATA = ROOT / "public" / "data"
PUBLIC_DATA.mkdir(parents=True, exist_ok=True)

# ---- 1) disease -> [symptoms]
df = pd.read_csv(ROOT / "dataset.csv")
df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
symptom_cols = [c for c in df.columns if c.startswith("symptom")]
target_col = "prognosis" if "prognosis" in df.columns else "disease"

# normalize strings
for c in symptom_cols:
    df[c] = df[c].astype(str).str.strip().str.lower().replace("nan", pd.NA)
df[target_col] = df[target_col].astype(str).str.strip()

disease_to_symptoms = {}
for _, row in df.iterrows():
    d = row[target_col]
    syms = [s for s in [row[c] for c in symptom_cols] if pd.notna(s)]
    disease_to_symptoms.setdefault(d, set()).update(syms)

disease_to_symptoms = {k: sorted(list(v)) for k, v in disease_to_symptoms.items()}

with open(PUBLIC_DATA / "disease_symptoms.json", "w") as f:
    json.dump(disease_to_symptoms, f, indent=2)

# ---- 2) disease -> description
desc = pd.read_csv(ROOT / "symptom_Description.csv")
desc.columns = [c.strip().lower().replace(" ", "_") for c in desc.columns]
# try to detect columns
d_col = [c for c in desc.columns if "prognosis" in c or "disease" in c][0]
t_col = [c for c in desc.columns if "description" in c][0]
desc[d_col] = desc[d_col].astype(str).str.strip()
description_map = dict(zip(desc[d_col], desc[t_col].astype(str)))

with open(PUBLIC_DATA / "descriptions.json", "w") as f:
    json.dump(description_map, f, indent=2)

# ---- 3) disease -> [precautions]
prec = pd.read_csv(ROOT / "symptom_precaution.csv")
prec.columns = [c.strip().lower().replace(" ", "_") for c in prec.columns]
d_col2 = [c for c in prec.columns if "prognosis" in c or "disease" in c][0]
prec[d_col2] = prec[d_col2].astype(str).str.strip()
prec_map = {}
for _, r in prec.iterrows():
    d = r[d_col2]
    steps = [str(r[c]).strip() for c in prec.columns if c != d_col2 and pd.notna(r[c])]
    steps = [s for s in steps if s and s.lower() != "nan"]
    prec_map[d] = steps

with open(PUBLIC_DATA / "precautions.json", "w") as f:
    json.dump(prec_map, f, indent=2)

print("Wrote:", [p.name for p in PUBLIC_DATA.iterdir()])
