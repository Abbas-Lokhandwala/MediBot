import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix
import joblib
import json

DATA_DIR = Path("./")
DATASET_CSV = DATA_DIR / "dataset.csv"
SEVERITY_CSV = DATA_DIR / "Symptom-severity.csv"
DESC_CSV = DATA_DIR / "symptom_Description.csv"
PRECAUTION_CSV = DATA_DIR / "symptom_precaution.csv"

ARTIFACTS_DIR = Path("./artifacts")
ARTIFACTS_DIR.mkdir(exist_ok=True, parents=True)

def load_data():
    df = pd.read_csv(DATASET_CSV)
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    symptom_cols = [c for c in df.columns if c.startswith("symptom")]
    target_col = "prognosis" if "prognosis" in df.columns else "disease"

    for c in symptom_cols:
        df[c] = df[c].astype(str).str.strip().str.lower().replace("nan", np.nan)

    all_symptoms = sorted(
        set(s for col in symptom_cols for s in df[col].dropna().unique())
    )

    sev = pd.read_csv(SEVERITY_CSV)
    sev.columns = [c.strip().lower().replace(" ", "_") for c in sev.columns]
    sev_sym_col = [c for c in sev.columns if "symptom" in c][0]
    sev_val_col = [c for c in sev.columns if c not in [sev_sym_col]][0]
    sev[sev_sym_col] = sev[sev_sym_col].str.strip().str.lower()
    severity_map = dict(zip(sev[sev_sym_col], pd.to_numeric(sev[sev_val_col], errors="coerce").fillna(1)))

    max_sev = max(severity_map.values()) if severity_map else 1
    norm_severity = {k: (v / max_sev) for k, v in severity_map.items()}

    symptom_index = {s: i for i, s in enumerate(all_symptoms)}
    X = np.zeros((len(df), len(all_symptoms)), dtype=np.float32)

    for row_i, row in df.iterrows():
        for c in symptom_cols:
            s = row[c]
            if pd.isna(s):
                continue
            w = norm_severity.get(s, 1.0)
            X[row_i, symptom_index[s]] = max(X[row_i, symptom_index[s]], w)

    y_raw = df[target_col].astype(str).str.strip()
    le = LabelEncoder()
    y = le.fit_transform(y_raw)

    return X, y, le, all_symptoms, norm_severity

def train_and_eval(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    clf = LogisticRegression(
        max_iter=2000,
        multi_class="auto",
        n_jobs=None,
        verbose=0
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_proba = None
    try:
        y_proba = clf.predict_proba(X_test)
    except Exception:
        pass

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "f1_macro": float(f1_score(y_test, y_pred, average="macro")),
        "report": classification_report(y_test, y_pred, output_dict=True)
    }
    cm = confusion_matrix(y_test, y_pred).tolist()

    return clf, metrics, cm

def save_artifacts(model, le, symptom_list, severity_map, metrics, cm):
    joblib.dump(model, ARTIFACTS_DIR / "model.joblib")
    joblib.dump(le, ARTIFACTS_DIR / "label_encoder.joblib")
    with open(ARTIFACTS_DIR / "symptom_list.json", "w") as f:
        json.dump(symptom_list, f)

    with open(ARTIFACTS_DIR / "severity_map.json", "w") as f:
        json.dump(severity_map, f)

    with open(ARTIFACTS_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    with open(ARTIFACTS_DIR / "confusion_matrix.json", "w") as f:
        json.dump(cm, f)

    print("Saved to ./artifacts")

if __name__ == "__main__":
    X, y, le, symptom_list, severity_map = load_data()
    model, metrics, cm = train_and_eval(X, y)
    save_artifacts(model, le, symptom_list, severity_map, metrics, cm)
    print("Accuracy:", metrics["accuracy"])
    print("F1 (macro):", metrics["f1_macro"])
