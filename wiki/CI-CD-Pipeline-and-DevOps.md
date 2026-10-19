# ⚙️ CI/CD Pipeline & DevOps Guide

Portfolio Builder 2.0 incorporates a **production-grade, 100% free automated CI/CD pipeline** implemented in GitHub Actions ([`.github/workflows/ci-cd.yml`](file:///c:/Users/E1536912/Documents/PORTFOLIO/.github/workflows/ci-cd.yml)). Every code commit and pull request is automatically audited for vulnerabilities, formatted, tested with ephemeral container databases, built, deployed, and reported.

---

## 🌊 Pipeline Architecture & Stages

```mermaid
flowchart TD
    Commit([Git Push / PR to main]) --> S1[Stage 1: Security & Vulnerability Scan]
    
    subgraph S1Details["Security Scanning Tools"]
        Gitleaks["Gitleaks OSS<br/>(Secret Detection)"]
        Trivy["Aqua Trivy<br/>(SCA Package CVEs)"]
        Semgrep["Semgrep SAST<br/>(OWASP Top 10)"]
        Bandit["Bandit AST Audit<br/>(ML & DRL Python Apps)"]
    end
    S1 --- S1Details

    S1 --> S2[Stage 2: Lint & Code Quality]
    subgraph S2Details["Quality Linters"]
        ESLint["ESLint Matrix<br/>(Gateway, Auth, Backend)"]
        Flake8["Flake8 PEP8 Matrix<br/>(ML Service & DRL Service)"]
    end
    S2 --- S2Details

    S2 --> S3[Stage 3: Automated Build & Testing]
    subgraph S3Details["Ephemeral Runner Environment"]
        MongoBox[("Docker mongo:7<br/>Service Container")]
        Jest["Jest & Supertest e2e<br/>(Gateway, Auth, Backend)"]
        PytestML["Pytest Suite<br/>(FastAPI ML Service)"]
        PytestDRL["Pytest Suite + HF Cache<br/>(Portfolio Intelligence DRL)"]
        ViteBuild["tsc & Vite Build<br/>(React Frontend)"]
    end
    S3 --- S3Details

    S3 --> BranchCheck{Branch == 'main'?}
    BranchCheck -- Yes --> S4[Stage 4: Continuous Deployment]
    BranchCheck -- No --> SkipDeploy[Skip Deployment]

    subgraph S4Details["Cloud Deployment"]
        CloudRun["Google Cloud Run<br/>(Path-Filtered: Gateway, Auth, Backend, ML, Intelligence)"]
        Vercel["Vercel Edge<br/>(React SPA)"]
    end
    S4 --- S4Details

    S4 --> S5[Stage 5: Email Notification]
    SkipDeploy --> S5

    subgraph S5Details["Reporting"]
        Report["Nodemailer HTML Email<br/>Status Badges, SHA, Logs"]
    end
    S5 --- S5Details
```

---

## 📌 Detailed Stage Breakdown

### Stage 1: Security & Vulnerability Scan (`security-scan`)
- **Gitleaks Secret Detection:** Deep-scans git history to catch committed tokens, API keys, and database passwords before they reach production.
- **Aqua Trivy SCA:** Scans `package-lock.json` and Python `requirements.txt` across all services for known Common Vulnerabilities and Exposures (CVEs) with `CRITICAL` or `HIGH` severity.
- **Semgrep SAST:** Evaluates TypeScript and Python source code against official rulesets: `p/security-audit` and `p/owasp-top-ten`.
- **Bandit Python AST Audits:** Inspects FastAPI AST structures for security vulnerabilities (insecure deserialization, weak ciphers) across both `ml-service-python/app` and `drl-service-python/app`.

### Stage 2: Lint & Code Quality (`lint` & `lint-python`)
- **ESLint Matrix:** Concurrently audits `api-gateway`, `auth-service`, and `portfolio_backend_nestjs` for type consistency and code quality.
- **Flake8 Matrix:** Audits both `ml-service-python` and `drl-service-python` for PEP8 compliance, undefined variables, and cyclomatic complexity limits (`--max-complexity=10`).

### Stage 3: Automated Build & Testing (`test-and-build`)
- **Ephemeral MongoDB Container:** The GitHub runner automatically boots an isolated `public.ecr.aws/docker/library/mongo:7` service container with port mapping `27017:27017`.
- **API Gateway Compilation & Tests:** Compiles `api-gateway`, runs Jest unit tests and Supertest e2e proxy tests.
- **Microservices Compilation & Tests:** Compiles `auth-service` and `portfolio_backend_nestjs`, executing Jest unit tests and Supertest API tests against the live ephemeral MongoDB container.
- **Python ML Tests (`test-ml-service`):** Runs `pytest tests/` with live or skipped LLM secrets.
- **Portfolio Intelligence DRL Tests (`test-drl-service`):** Runs `pytest tests/` for XGBoost ATS regressor, SHAP tree explainer, k-NN skill graphs, and LinUCB multi-armed bandit, downloading cached artifacts from Hugging Face Model Hub using `HF_TOKEN`.
- **Frontend Build (`test-and-build-frontend`):** Runs `tsc --noEmit` type checking and compiles the Vite production bundle.

### Stage 4: Continuous Deployment (`deploy`)
- Executes **strictly on push to `main`** after Stages 1, 2, and 3 pass with 100% success.
- **Smart Path-Filtering:** Uses `dorny/paths-filter@v3` to only trigger container builds and deployments for services whose files were modified.
- **Google Cloud Run Deployment:** Authenticates via Google Cloud Service Account (`GCP_SA_KEY`) and issues zero-downtime rolling container deploys via `gcloud run deploy`:
  - `portfolio-api-gateway` (asia-south1, 512Mi)
  - `portfolio-auth-service` (asia-south1, 512Mi)
  - `portfolio-backend` (asia-south1, 512Mi)
  - `portfolio-ml-service` (asia-south1, 512Mi)
  - `portfolio-intelligence-service` (asia-south1, 2Gi RAM)
- **Vercel Frontend Deployment:** Dispatches webhook trigger to `VERCEL_DEPLOY_HOOK` (or CLI prebuilt deployment via `VERCEL_TOKEN`) to deploy the React bundle to global edge CDNs.

### Stage 5: Email Notification (`notify`)
- Runs unconditionally (`if: always()`) via the custom composite action `.github/actions/send-email-report`.
- Evaluates the collective result of all preceding jobs.
- Dispatches a dark-themed, responsive HTML status email with build metrics, author, commit hash, and direct links to GitHub Actions run logs.

---

## 🔑 Required GitHub Secrets (100% Free)

Configure in GitHub: **Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret**

| Secret Name | Category | Description | Example / Format |
|---|---|---|---|
| `GCP_SA_KEY` | Deploy | Google Cloud Service Account JSON Key for `github-deployer` | `{"type": "service_account", ...}` |
| `GCP_PROJECT_ID` | Deploy | Google Cloud Project ID | `deft-shade-439004-e1` |
| `VERCEL_DEPLOY_HOOK` | Deploy | Vercel Git Deploy Hook URL | `https://api.vercel.com/v1/integrations/deploy/prj_...` |
| `VERCEL_TOKEN` | Deploy | Optional Vercel personal access token | `vcp_...` |
| `WIKI_PAT` | Wiki | GitHub Personal Access Token for wiki auto-sync | `github_pat_...` |
| `HF_TOKEN` | Testing | Hugging Face Hub token to read model registry in CI runner | `hf_...` |
| `MAIL_USERNAME` | Notify | Gmail address used by Nodemailer | `your-email@gmail.com` |
| `MAIL_PASSWORD` | Notify | 16-character Google App Password | `xxxx xxxx xxxx xxxx` |
| `NOTIFICATION_EMAIL` | Notify | Destination recipient email | `recipient@example.com` |
| `GROQ_API_KEY` | Testing | Groq Cloud API key for CI live tests | `gsk_...` |
| `OPENROUTER_API_KEY` | Testing | OpenRouter API key | `sk-or-...` |
| `GEMINI_API_KEY` | Testing | Google Gemini AI Studio API key | `AIzaSy...` |

---

## 📁 Modular Composite Actions

To avoid duplicate code across jobs, the pipeline leverages three reusable composite actions:

1. **[setup-node-service](file:///c:/Users/E1536912/Documents/PORTFOLIO/.github/actions/setup-node-service/action.yml):** Configures Node.js 18 with automatic `npm` dependency caching.
2. **[setup-python-service](file:///c:/Users/E1536912/Documents/PORTFOLIO/.github/actions/setup-python-service/action.yml):** Configures Python 3.11 with `pip` dependency caching.
3. **[send-email-report](file:///c:/Users/E1536912/Documents/PORTFOLIO/.github/actions/send-email-report/action.yml):** Builds and dispatches the dark-themed HTML report via Nodemailer SMTP.

---

[Explore Deployment & Hosting Guide ➔](Deployment-and-Hosting-Guide)
