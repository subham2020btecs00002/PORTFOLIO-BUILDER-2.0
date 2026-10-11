---
language:
- en
tags:
- tabular-regression
- reinforcement-learning
- contextual-bandit
- xgboost
- scikit-learn
- explainable-ai
- shap
- portfolio-optimization
license: mit
pipeline_tag: tabular-regression
---

# 🧠 Portfolio Intelligence Engine
### High-Performance Pure ML & DRL Models for Portfolio Builder 2.0

Official model registry for **Portfolio Builder 2.0**. This repository hosts pre-trained statistical scoring, explainability, and dynamic layout policy models.

---

## 📊 Models & Artifacts in this Repository

| Artifact | Technology | Purpose | Size |
|---|---|---|---|
| `ats_xgboost.joblib` | XGBoost Regressor + SHAP | Predicts portfolio competitiveness score (0-100) with local additive feature attribution | ~300 KB |
| `skill_knn.joblib` | k-NN Graph (Cosine) | Computes tech-stack co-occurrence affinity and detects missing skill gaps | ~80 KB |
| `bandit_priors.json` | LinUCB Matrix Priors | Pre-calibrated covariance matrices and bias vectors across 6 candidate layout actions | ~15 KB |
| `feature_schema.json` | JSON Schema | 24-feature definitions, types, and scoring rubrics | ~5 KB |

---

## 🎯 Model Performance & Evaluation
- **Benchmark Evaluation:** R² Score: 0.9271 | RMSE: 3.2000 points
- **Inference Latency:** < 15 ms (FastAPI on Render Free-Tier CPU)
- **Memory Footprint:** ~135 MB RAM
- **DRL Exploration:** 20,000 simulated recruiter interaction episodes across 3 personas (HR Skimmer, Tech Lead, Product Reviewer).

---

## 💻 Quickstart with `huggingface_hub`

```python
import joblib
from huggingface_hub import hf_hub_download

# Download XGBoost model package
model_path = hf_hub_download(
    repo_id="sk22082001/portfolio-intelligence-engine",
    filename="ats_xgboost.joblib"
)
package = joblib.load(model_path)
model = package["model"]
feature_names = package["feature_names"]

print(f"Loaded {len(feature_names)} feature model successfully!")
```

---

## 🛡️ License & Maintenance
Maintained by the **Portfolio Builder 2.0 Engineering Team**. Licensed under the [MIT License](https://opensource.org/licenses/MIT).
