import joblib
import json
import numpy as np
from pathlib import Path

ARTIFACTS_DIR = Path("./artifacts")

class MedibotModel:
    def __init__(self, artifacts_dir=ARTIFACTS_DIR):
        self.model = joblib.load(artifacts_dir / "model.joblib")
        self.le = joblib.load(artifacts_dir / "label_encoder.joblib")
        with open(artifacts_dir / "symptom_list.json") as f:
            self.symptom_list = json.load(f)
        with open(artifacts_dir / "severity_map.json") as f:
            self.severity_map = json.load(f)

        self.index = {s: i for i, s in enumerate(self.symptom_list)}
        self.has_proba = hasattr(self.model, "predict_proba")

    def vectorize(self, symptoms_with_severity):
        """
        symptoms_with_severity:
          - list of symptom strings, OR
          - dict {symptom: severity(1-5)}, severity optional
        """
        x = np.zeros((1, len(self.symptom_list)), dtype=np.float32)

        if isinstance(symptoms_with_severity, dict):
            items = symptoms_with_severity.items()
        else:
            items = [(s, 1) for s in symptoms_with_severity]

        max_train = max(self.severity_map.values()) if self.severity_map else 1
        for s, sev in items:
            s = str(s).strip().lower()
            if s not in self.index:
                continue
            train_w = float(self.severity_map.get(s, 1.0))
            user_w = float(sev) / 5.0 if sev is not None else 1.0
            x[0, self.index[s]] = max(x[0, self.index[s]], train_w * user_w / max_train)

        return x

    def predict_topk(self, symptoms, k=3):
        X = self.vectorize(symptoms)
        if self.has_proba:
            proba = self.model.predict_proba(X)[0]
            top_idx = np.argsort(proba)[::-1][:k]
            results = [
                {"disease": self.le.inverse_transform([int(i)])[0],
                 "prob": float(proba[i])}
                for i in top_idx
            ]
            return results
        else:
            pred = self.le.inverse_transform(self.model.predict(X))[0]
            return [{"disease": pred, "prob": None}]

if __name__ == "__main__":
    bot = MedibotModel()

    symptoms = ["itching", "skin_rash", "nodal_skin_eruptions"]
    print("Top predictions (list):", bot.predict_topk(symptoms, k=3))

    symptoms2 = {"itching": 3, "skin_rash": 4, "nodal_skin_eruptions": 2}
    print("Top predictions (dict):", bot.predict_topk(symptoms2, k=3))
