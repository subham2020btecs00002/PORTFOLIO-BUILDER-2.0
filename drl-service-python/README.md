# 🧠 Portfolio Intelligence Microservice (`portfolio-intelligence-service`)

High-performance, pure Machine Learning and Deep Reinforcement Learning microservice for **Portfolio Builder 2.0**.

---

## 🏛️ Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │        Portfolio Backend (:5000)       │
                      └──────────────────┬─────────────────────┘
                                         │ HTTP (x-internal-secret)
                                         ▼
                      ┌────────────────────────────────────────┐
                      │    FastAPI Intelligence Service :8001  │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   ┌──────────────────────────┐                    ┌──────────────────────────┐
   │    Pure ML Scoring Engine│                    │   DRL Layout Policy      │
   │  • 24-feature extractor  │                    │  • LinUCB Contextual     │
   │  • XGBoost Regressor     │                    │  • 6 Candidate Layouts   │
   │  • SHAP TreeExplainer    │                    │  • Real-time updates     │
   │  • k-NN Skill Gap Graph  │                    │  • 20k simulated priors  │
   └─────────────┬────────────┘                    └─────────────┬────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         │
                                         ▼
                      ┌────────────────────────────────────────┐
                      │   Hugging Face Model Hub (Registry)    │
                      │ sk22082001/portfolio-intelligence-engine│
                      └────────────────────────────────────────┘
```

---

## 📦 Production Artifacts Hosted on Hugging Face

| Artifact | Engine | Description | Size |
|---|---|---|---|
| `ats_xgboost.joblib` | Pure ML | Pre-trained XGBoost Regressor for portfolio ATS score prediction (0–100) | ~300 KB |
| `skill_knn.joblib` | Pure ML | k-NN cosine graph across 120+ industry technologies for skill gap recommendations | ~80 KB |
| `bandit_priors.json` | DRL | Pre-calibrated covariance matrices ($A$) and reward vectors ($b$) across 6 layout actions | ~15 KB |
| `feature_schema.json` | Metadata | JSON schema containing 24-feature definitions and normalization ranges | ~5 KB |

---

## 🛠️ Offline Training & Publishing Workflow

### 1. Run Offline Training & Persona Simulation
```bash
python scripts/train_offline.py
```
- Augments profile corpus to 650 profiles.
- Trains the XGBoost Regressor with 24 engineered features.
- Computes the SHAP TreeExplainer baseline.
- Fits the k-NN skill co-occurrence graph.
- Simulates 20,000 recruiter interaction episodes across 3 personas (HR Skimmer, Tech Lead, Product Reviewer).
- Outputs production artifacts to `artifacts/`.

### 2. Publish to Hugging Face Model Hub
```bash
python scripts/publish_to_hf.py
```
- Authenticates using `HF_TOKEN`.
- Uploads all artifacts and generates the official Model Card on Hugging Face.

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | HTTP port for the service (default: `8001` locally, `10000` on Render) |
| `INTERNAL_SECRET` | Yes | Cryptographic secret for inter-service authorization |
| `HF_TOKEN` | Yes | Hugging Face access token with write access for publishing |
| `HF_MODEL_REPO_ID` | Yes | Repository identifier (`sk22082001/portfolio-intelligence-engine`) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string for persistent LinUCB bandit state |
