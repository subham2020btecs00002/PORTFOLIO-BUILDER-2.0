# ☁️ Deployment & Hosting Guide

Portfolio Builder 2.0 is designed for **100% free production hosting** by pairing **Render Blueprint Infrastructure-as-Code** (for backend microservices) with **Vercel** (for the React SPA) and **MongoDB Atlas** (for managed database storage).

---

## 🏗️ Production Hosting Architecture

```
                             [ User Browser ]
                              │            │
            ┌─────────────────┘            └─────────────────┐
            │ (Static Assets & HTML)                         │ (API Requests)
            ▼                                                ▼
 ┌───────────────────────┐                        ┌───────────────────────┐
 │     Vercel Edge       │                        │      Render PaaS      │
 │  React 18 SPA (Vite)  │                        │  portfolio-api-gateway│
 └───────────────────────┘                        └──────────┬────────────┘
                                                             │ (Internal Routing)
                                      ┌──────────────────────┼──────────────────────┐
                                      ▼                      ▼                      ▼
                           ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
                           │portfolio-auth      │ │portfolio-backend   │ │portfolio-ml        │
                           │(Port 10000 / Node) │ │(Port 10000 / Node) │ │(Port 10000/ Python)│
                           └─────────┬──────────┘ └──────────┬──────────┘ └─────────┬──────────┘
                                     │                       │                      │
                                     └───────────┬───────────┘                      │
                                                 ▼                                  ▼
                                      ┌────────────────────┐             ┌────────────────────┐
                                      │   MongoDB Atlas    │             │   Gemini / Groq    │
                                      │   (Cloud Cluster)  │             │   (LLM Providers)  │
                                      └────────────────────┘             └────────────────────┘
```

---

## 1. Backend Microservices Deployment (Render)

The repository provides an Infrastructure-as-Code Blueprint file ([`render.yaml`](file:///c:/Users/E1536912/Documents/PORTFOLIO/render.yaml)) defining all 4 backend services:

### Step-by-Step Render Setup:
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints ➔ New Blueprint Instance**.
3. Connect your repository: `subham2020btecs00002/PORTFOLIO-BUILDER-2.0`.
4. Render will automatically parse `render.yaml` and provision:
   - `portfolio-api-gateway` (Node.js web service, root: `api-gateway`)
   - `portfolio-auth-service` (Node.js web service, root: `auth-service`)
   - `portfolio-backend` (Node.js web service, root: `portfolio_backend_nestjs`)
   - `portfolio-ml-service` (Python web service, root: `ml-service-python`)
5. Populate required environment variables in the Render Dashboard for each service:
   - **Gateway:** `JWT_SECRET`, `INTERNAL_SECRET`, `AUTH_SERVICE_URL`, `BACKEND_URL`, `FRONTEND_URL`.
   - **Auth:** `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `INTERNAL_SECRET`, `EMAIL`, `PASSWORD`.
   - **Backend:** `MONGO_URI`, `INTERNAL_SECRET`, `ML_SERVICE_URL`, `EMAIL`, `PASSWORD`.
   - **ML:** `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `GEMINI_API_KEY`.

---

## 2. Frontend Deployment (Vercel)

The React SPA is configured for Vercel deployment with client-side routing support via [`PORTFOLIO_FRONTEND-main/vercel.json`](file:///c:/Users/E1536912/Documents/PORTFOLIO/PORTFOLIO_FRONTEND-main/vercel.json):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step-by-Step Vercel Setup:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New... ➔ Project** and import `PORTFOLIO-BUILDER-2.0`.
3. In **Project Settings**:
   - **Root Directory:** Set to `PORTFOLIO_FRONTEND-main`.
   - **Framework Preset:** Vite.
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Set Environment Variables:
   - `REACT_APP_API_BASE_URL` = `https://portfolio-api-gateway.onrender.com`
5. Click **Deploy**.

---

## 3. Database Setup (MongoDB Atlas)

1. Create a free shared cluster (`M0 Sandbox`) on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. **Database Access:** Create a database user with read/write permissions on the portfolio database.
3. **Network Access:** Add IP Address `0.0.0.0/0` (Allow Access from Anywhere) so Render dynamic cloud IP addresses can connect securely.
4. Copy your connection string into `MONGO_URI`:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/portfolio_builder?retryWrites=true&w=majority
   ```

---

## 4. SMTP Email Setup (Gmail)

1. Open your Google Account ➔ **Security**.
2. Verify **2-Step Verification** is enabled.
3. Navigate to **App passwords** ([myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create an App password named `Portfolio Builder`.
5. Copy the generated 16-character string into `PASSWORD` and your Gmail into `EMAIL`.

---

## 5. Setting Up Zero-Downtime Deploy Hooks

To enable the automated continuous deployment stage in GitHub Actions:
1. In the **Render Dashboard**, open each service ➔ **Settings** ➔ Scroll down to **Deploy Hook**.
2. Copy the Webhook URL and add it to your repository secrets in GitHub:
   - `RENDER_GATEWAY_DEPLOY_HOOK`
   - `RENDER_AUTH_DEPLOY_HOOK`
   - `RENDER_BACKEND_DEPLOY_HOOK`
   - `RENDER_ML_DEPLOY_HOOK`
3. In the **Vercel Dashboard**, open project ➔ **Settings ➔ Git ➔ Deploy Hooks** ➔ Create Hook (`main` branch) and save as `VERCEL_DEPLOY_HOOK`.

---

[Explore Local Development & Setup ➔](Local-Development-Setup)
