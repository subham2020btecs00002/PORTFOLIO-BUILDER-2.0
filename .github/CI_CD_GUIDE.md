# 🚀 Portfolio Builder 2.0 — CI/CD Pipeline Guide

This repository contains a production-grade, 100% free CI/CD pipeline built with **GitHub Actions**.

---

## 📌 Pipeline Stages

1. **Security & Vulnerability Scan (`security-scan`)**:
   - **Secret Detection**: `gitleaks` scans git commits for accidentally committed secrets.
   - **Package Vulnerability Scan (SCA)**: `aquasecurity/trivy-action` scans `package-lock.json` and Python dependencies for known CVEs.
   - **Static Code Analysis (SAST)**: `semgrep` scans for OWASP Top 10 vulnerabilities in TypeScript/JavaScript/Python.
   - **Python AST Security**: `bandit` analyzes FastAPI source code.

2. **Lint & Code Quality (`lint`)**:
   - Runs ESLint across `api-gateway`, `auth-service`, and `portfolio_backend_nestjs`.
   - Runs Flake8 syntax checks on `ml-service-python`.

3. **Build & Automated Testing (`test-and-build`)**:
   - Boots an ephemeral **Docker `mongo:7` service container** directly inside the GitHub runner.
   - Runs compilation (`npm run build`) for all NestJS microservices.
   - Runs unit tests (`npm run test`) and Supertest API tests (`npm run test:e2e`).
   - Runs Python `pytest` suite for `ml-service-python`.
   - Runs TypeScript type checking (`tsc --noEmit`) and Vite production bundle (`npm run build`) for `PORTFOLIO_FRONTEND-main`.

4. **Continuous Deployment (`deploy`)**:
   - Runs **only on push to `main`** after all security, lint, build, and test steps succeed.
   - Triggers rolling zero-downtime deploys on Render using **Render Deploy Hooks**.
   - Triggers production deploy on Vercel.

5. **Email Notification (`notify`)**:
   - Always executes upon completion (success or failure).
   - Sends a dark-themed HTML report with badge status, commit hash, author, and direct link to GitHub Actions logs.

---

## 🔑 Required GitHub Secrets Setup (100% Free)

Go to your repository on GitHub:  
**Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret**

### 1. Render Deploy Hooks (Backends)
Render provides free webhook URLs to trigger instant deployments without needing API keys.
1. In the [Render Dashboard](https://dashboard.render.com), open each service:
   - `portfolio-api-gateway` ➔ **Settings** ➔ Scroll to **Deploy Hook** ➔ Copy the Webhook URL.
   - `portfolio-auth-service` ➔ **Settings** ➔ Scroll to **Deploy Hook** ➔ Copy the Webhook URL.
   - `portfolio-backend` ➔ **Settings** ➔ Scroll to **Deploy Hook** ➔ Copy the Webhook URL.
2. Add them as repository secrets in GitHub:
   - `RENDER_GATEWAY_DEPLOY_HOOK`
   - `RENDER_AUTH_DEPLOY_HOOK`
   - `RENDER_BACKEND_DEPLOY_HOOK`

### 2. Vercel Deployment (Frontend)
Choose **either** Method A (Deploy Hook) or Method B (Vercel CLI):

#### Method A: Deploy Hook (Easiest & Recommended)
1. Go to your project on [Vercel](https://vercel.com) ➔ **Settings** ➔ **Git**.
2. Scroll to **Deploy Hooks** ➔ Click **Create Hook** (Branch: `main`).
3. Add the secret to GitHub:
   - `VERCEL_DEPLOY_HOOK` = `https://api.vercel.com/v1/integrations/deploy/prj_.../...`

#### Method B: Vercel Token & Project ID
1. In Vercel Account Settings ➔ **Tokens** ➔ Create a token (`VERCEL_TOKEN`).
2. In Project Settings ➔ **General** ➔ Copy Project ID (`VERCEL_PROJECT_ID`) and Team/User ID (`VERCEL_ORG_ID`).

### 3. Email Notifications (Gmail SMTP)
1. Open your Google Account ➔ **Security** ➔ Enable **2-Step Verification** (if not already enabled).
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Generate an App Password (App name: `GitHub Actions CI/CD`).
4. Add the secrets to GitHub:
   - `MAIL_USERNAME` = `your-email@gmail.com`
   - `MAIL_PASSWORD` = `xxxx xxxx xxxx xxxx` (the 16-character App Password without spaces)
   - `NOTIFICATION_EMAIL` = `your-destination-email@gmail.com`

---

## 📁 Repository Modular Structure

```
.github/
├── actions/
│   ├── setup-node-service/action.yml    # Reusable Node setup & npm cache
│   ├── setup-python-service/action.yml  # Reusable Python setup & pip cache
│   └── send-email-report/action.yml     # Reusable HTML SMTP email notifier
├── workflows/
│   └── ci-cd.yml                        # 5-stage automated CI/CD pipeline
└── CI_CD_GUIDE.md                       # Setup & operations documentation
```

---

## 🛠 Local Verification Commands

To verify all components locally before pushing:

```bash
# 1. API Gateway
cd api-gateway && npm run lint && npm run test && npm run test:e2e

# 2. Auth Service
cd ../auth-service && npm run lint && npm run test && npm run test:e2e

# 3. Portfolio Backend
cd ../portfolio_backend_nestjs && npm run lint && npm run test && npm run test:e2e

# 4. ML Service (Python)
cd ../ml-service-python && pytest tests/

# 5. Frontend
cd ../PORTFOLIO_FRONTEND-main && npm run typecheck && npm run build
```
