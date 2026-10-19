# ☁️ Deployment & Hosting Guide

Portfolio Builder 2.0 is deployed on **100% free production hosting** by combining **Google Cloud Run** (for 5 serverless containerized backend microservices) with **Vercel** (for the high-speed edge React SPA), **Hugging Face Model Hub** (for machine learning model artifacts), and **MongoDB Atlas** (for cloud database storage).

---

## 🏗️ Production Hosting Architecture

```
                             [ User Browser ]
                              │            │
            ┌─────────────────┘            └─────────────────┐
            │ (Static Assets & HTML)                         │ (API Requests - HTTPS)
            ▼                                                ▼
 ┌───────────────────────┐                        ┌───────────────────────┐
 │      Vercel Edge      │                        │    Google Cloud Run   │
 │  React 18 SPA (Vite)  │                        │ portfolio-api-gateway │
 └───────────────────────┘                        └──────────┬────────────┘
                                                             │ (Internal HTTPS Routing)
                  ┌──────────────────────┬───────────────────┼───────────────────┬──────────────────────┐
                  ▼                      ▼                   ▼                   ▼                      ▼
       ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
       │portfolio-auth      │ │portfolio-backend   │ │portfolio-ml        │ │portfolio-          │ │                    │
       │(Node 20 / CloudRun)│ │(Node 20 / CloudRun)│ │(Python / CloudRun) │ │intelligence        │ │                    │
       │                    │ │                    │ │                    │ │(Python 2GiB RAM)   │ │                    │
       └─────────┬──────────┘ └──────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘ └────────────────────┘
                 │                       │                      │                      │
                 └───────────┬───────────┘                      ▼                      ▼
                             ▼                             ┌──────────┐           ┌──────────┐
                  ┌────────────────────┐                   │Gemini/   │           │Hugging   │
                  │   MongoDB Atlas    │                   │Groq LLMs │           │Face Hub  │
                  │   (Cloud Cluster)  │                   └──────────┘           └──────────┘
                  └────────────────────┘
```

---

## 🌐 Production Service Endpoints

| Service | Host | Live Production URL | Specs & Resources |
| :--- | :--- | :--- | :--- |
| **Frontend SPA** | Vercel | `https://portfolio-builder-2-0-theta.vercel.app` | Global Edge CDN |
| **API Gateway** | Cloud Run | `https://portfolio-api-gateway-607427972949.asia-south1.run.app` | 512 MiB RAM, 1 vCPU |
| **Auth Service** | Cloud Run | `https://portfolio-auth-service-607427972949.asia-south1.run.app` | 512 MiB RAM, 1 vCPU |
| **Portfolio Backend** | Cloud Run | `https://portfolio-backend-607427972949.asia-south1.run.app` | 512 MiB RAM, 1 vCPU |
| **ML Service** | Cloud Run | `https://portfolio-ml-service-607427972949.asia-south1.run.app` | 512 MiB RAM, 1 vCPU |
| **Intelligence DRL** | Cloud Run | `https://portfolio-intelligence-service-607427972949.asia-south1.run.app` | **2 GiB RAM**, 1 vCPU |

---

## 💡 Architecture Decision: Why Google Cloud Run Over Render?

1. **Elimination of the 750-Hour Account Trap**:
   * Render restricts free accounts to a combined pool of 750 wall-clock instance hours per month. Running 5 microservices burns $5 \times 24 = 120\text{ hours/day}$, exhausting the quota in just **6.25 days** and triggering account suspension.
   * Google Cloud Run charges **$0.00 when idle**. Containers scale down to 0 instances when not in use. You get **2,000,000 requests per month completely free forever**.
2. **2 GiB Memory Allocation for XGBoost/SHAP**:
   * Render caps free services at 512 MB RAM, triggering Out-Of-Memory (OOM) crashes on machine learning workloads.
   * Cloud Run permits up to 2–4 GiB RAM allocations on its free tier, allowing SHAP tree explainers and LinUCB bandit policies to compute smoothly.
3. **Native Automated HTTPS**:
   * Every Cloud Run service receives a valid Google SSL certificate, preventing browser Mixed Content blocking when communicating with the Vercel HTTPS frontend.

---

## 1. Backend Microservices Deployment (Google Cloud Run)

Each backend service contains an optimized multi-stage production Dockerfile:
* [`api-gateway/Dockerfile`](file:///c:/Users/E1536912/Documents/PORTFOLIO/api-gateway/Dockerfile)
* [`auth-service/Dockerfile`](file:///c:/Users/E1536912/Documents/PORTFOLIO/auth-service/Dockerfile)
* [`portfolio_backend_nestjs/Dockerfile`](file:///c:/Users/E1536912/Documents/PORTFOLIO/portfolio_backend_nestjs/Dockerfile)
* [`ml-service-python/Dockerfile`](file:///c:/Users/E1536912/Documents/PORTFOLIO/ml-service-python/Dockerfile)
* [`drl-service-python/Dockerfile`](file:///c:/Users/E1536912/Documents/PORTFOLIO/drl-service-python/Dockerfile)

### Deployment Commands via Google Cloud Shell

```bash
# 1. ML Service (FastAPI)
gcloud run deploy portfolio-ml-service \
  --source ./ml-service-python \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "^#^ENVIRONMENT=production#GROQ_API_KEY=...#OPENROUTER_API_KEY=...#GEMINI_API_KEY=...#INTERNAL_SECRET=..."

# 2. Intelligence DRL Service (FastAPI / XGBoost / SHAP)
gcloud run deploy portfolio-intelligence-service \
  --source ./drl-service-python \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "^#^NODE_ENV=production#INTERNAL_SECRET=...#HF_TOKEN=...#HF_MODEL_REPO_ID=...#MONGO_URI=..."

# 3. Auth Service (NestJS)
gcloud run deploy portfolio-auth-service \
  --source ./auth-service \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "^#^NODE_ENV=production#MONGO_URI=...#JWT_SECRET=...#JWT_REFRESH_SECRET=...#INTERNAL_SECRET=...#GATEWAY_URL=...#FRONTEND_URL=...#BREVO_API_KEY=...#EMAIL=...#PASSWORD=...#RECEIVER_EMAIL=..."

# 4. Portfolio Backend (NestJS)
gcloud run deploy portfolio-backend \
  --source ./portfolio_backend_nestjs \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "^#^NODE_ENV=production#MONGO_URI=...#INTERNAL_SECRET=...#GATEWAY_URL=...#FRONTEND_URL=...#ML_SERVICE_URL=...#INTELLIGENCE_SERVICE_URL=...#AUTH_SERVICE_URL=...#BREVO_API_KEY=...#EMAIL=...#PASSWORD=...#RECEIVER_EMAIL=..."

# 5. API Gateway (NestJS)
gcloud run deploy portfolio-api-gateway \
  --source ./api-gateway \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "^#^NODE_ENV=production#JWT_SECRET=...#INTERNAL_SECRET=...#AUTH_SERVICE_URL=...#BACKEND_URL=...#FRONTEND_URL=..."
```

---

## 2. Frontend Deployment (Vercel)

The React SPA is deployed on Vercel with automatic rewrites configured in [`PORTFOLIO_FRONTEND-main/vercel.json`](file:///c:/Users/E1536912/Documents/PORTFOLIO/PORTFOLIO_FRONTEND-main/vercel.json).

### Vercel Environment Variables:
* `REACT_APP_BASE_URL` = `https://portfolio-api-gateway-607427972949.asia-south1.run.app`
* `VITE_BASE_URL` = `https://portfolio-api-gateway-607427972949.asia-south1.run.app`

---

## 3. Database Setup (MongoDB Atlas)

1. Create a free shared cluster (`M0 Sandbox`) on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Network Access:** Whitelist `0.0.0.0/0` (Allow Access from Anywhere) so Google Cloud Run dynamic IP pools can establish secure SSL connections.
3. Database connection string format:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

---

## 4. Email Services (Gmail SMTP & Brevo API)

* **Brevo API (`BREVO_API_KEY`)**: Used by `auth-service` and `portfolio_backend_nestjs` for high-deliverability transactional emails (password reset, contact forms) via HTTPS.
* **Nodemailer SMTP Fallback**: Configured with `EMAIL` and Gmail App Password (`PASSWORD`).

---

## 5. Automated CI/CD Deployment via GitHub Actions

GitHub Actions automatically builds and deploys to Google Cloud Run when code is merged into `main`:
* Configured in [`.github/workflows/ci-cd.yml`](file:///c:/Users/E1536912/Documents/PORTFOLIO/.github/workflows/ci-cd.yml).
* Uses path-filtering: only rebuilds and deploys the specific microservice whose folder changed.
* Authenticates via `GCP_SA_KEY` and `GCP_PROJECT_ID` secrets.

---

[Explore Architecture Overview ➔](Architecture-Overview)
