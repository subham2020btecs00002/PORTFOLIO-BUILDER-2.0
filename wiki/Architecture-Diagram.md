# 🖼️ System Architecture Diagram (Visual Blueprint)

Below is the comprehensive visual architecture diagram for **Portfolio Builder 2.0**, illustrating the client layers, gateway middleware pipeline, internal backend services, external LLM integrations, machine learning model registries, and persistent databases.

---

## 🎨 Architectural Visual Diagram

<div align="center">
  <img width="100%" alt="Portfolio Management Architecture Diagram" src="https://github.com/user-attachments/assets/f4c475b3-7878-4ec3-a380-ef95bb111597" style="border: 1px solid #30363d; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);" />
</div>

---

## 🧭 Comprehensive Diagram Walkthrough

The diagram is organized into **4 primary architectural zones** and numbered communication channels:

### 1. Client Zone (Port 3000)
| Node | Technology | Description |
|---|---|---|
| **React SPA Frontend** | React 18, TS, Bootstrap | Single Page Application rendering dynamic builder controls and public portfolios. |
| **`usePortfolioForm` Hook** | React Hooks | Manages centralized form state, validation schemas, and API synchronizations. |
| **`PortfolioFormShell`** | React Component | Layout shell providing collapsible section cards, navigation steps, and action triggers. |
| **Templates Gallery** | Dynamic Components | 11 visual layout templates loaded on-demand based on user selection. |
| **Intelligence Dashboard** | React Component | Interactive AI/DRL studio displaying live XGBoost ATS score, SHAP waterfall cards, and LinUCB simulation. |
| **Multipart File Handler** | FormData / Fetch API | Uploads PDF resumes to parsing endpoints and handles profile avatar crops. |
| **SSE Client Listener** | HTML5 `EventSource` | Subscribes to `/api/portfolio/ai/stream/:userId` for live recommendations. |

---

### 2. API Gateway Zone (Port 3001)
| Node | Technology | Description |
|---|---|---|
| **API Gateway Facade** | NestJS HTTP Gateway | Primary reverse proxy entrypoint on port `3001` (or port `10000` in cloud production). |
| **`RateLimiterMiddleware`** | Express Rate Limit | Enforces request quotas per IP address to safeguard services from abuse. |
| **`JwtVerifyMiddleware`** | `@nestjs/jwt` | Verifies access tokens in cookies (`access_token`) or headers, injecting `x-user-id` and `x-user-role`. |
| **Proxy Manager** | `http-proxy-middleware` | Injects secret header `x-internal-secret`, rewrites CORS headers, and routes upstream. |

---

### 3. Internal Backend Services Zone
| Node | Technology | Description |
|---|---|---|
| **Auth Service** | NestJS REST (Port 5001) | User entity persistence, credential validation, bcrypt hashing, username slugs, and password resets. |
| **Portfolio Monolith Backend** | NestJS REST (Port 5000) | Portfolio CRUD, slug resolution, contact form processing, analytics aggregation, and ML/DRL orchestration. |
| **`AiStreamService`** | NestJS SSE | Real-time Server-Sent Events emitter streaming AI insights back to the client. |
| **Python ML Service** | FastAPI (Port 8000) | High-performance Python service executing PyMuPDF layout-aware text parsing and LLM inference. |
| **Portfolio Intelligence DRL Service** | FastAPI (Port 8001) | In-house machine learning service executing XGBoost ATS regression, TreeSHAP game theory, and LinUCB bandit layout policies. |

---

### 4. Databases & External APIs Zone
| Node | Technology | Description |
|---|---|---|
| **MongoDB Atlas** | Cloud MongoDB Cluster | Stores user credentials, portfolio documents, analytics metrics, and contact inquiries. |
| **Hugging Face Model Registry** | Hub (`sk22082001/portfolio-intelligence-engine`) | Hosts versioned XGBoost and bandit weight artifacts cached locally on boot. |
| **Google Gemini / Groq / OpenRouter** | Multi-Provider LLMs | External multimodal/text LLM endpoints (`gemini-1.5-flash`, `llama-3.3-70b`) for parsing and rephrasing. |
| **Gmail SMTP Server** | Nodemailer Relay | Cloud SMTP mailer used by Auth Service and Portfolio Backend for transactional messages. |
| **Render & Vercel** | Cloud PaaS Infrastructure | Cloud hosting platforms executing 5 backend services and serving the static React bundle. |

---

## 🔀 Step-by-Step Flow Execution Map

1. **Step 1 — Inbound HTTP Request:** Client SPA dispatches HTTP request (Auth, Portfolio, AI, or Intelligence) to the API Gateway on port `3001`.
2. **Step 2 — Rate Limiting Check:** `RateLimiterMiddleware` validates request quota.
3. **Step 3 — JWT Verification:** `JwtVerifyMiddleware` decodes token signature. If valid, attaches `x-user-id` and `x-user-role` headers. Public routes and prefixes bypass token check.
4. **Step 4 — Route & Gateway Secret Injection:** `Proxy Manager` injects secret header `x-internal-secret`.
5. **Step 5a — Auth Proxy:** Forwarded to `http://localhost:5001/api/auth/*`.
6. **Step 5b — Portfolio Proxy:** Forwarded to `http://localhost:5000/api/portfolio/*`, `/api/contact/*`, or `/api/admin/*`.
7. **Step 6a — Auth Database Queries:** Auth Service persists or reads user documents from MongoDB Atlas.
8. **Step 6b — Auth Emails:** Auth Service sends password reset emails via Gmail SMTP.
9. **Step 6c — Portfolio DB Operations:** Portfolio Backend reads/writes portfolio schemas and views in MongoDB Atlas.
10. **Step 7 & 8 — Generative AI & NLP Inference:** Portfolio Backend invokes Python ML Service (`/api/ml/enhance` or `/api/ml/parse-resume`), querying Google Gemini, Groq, or OpenRouter.
11. **Step 9 & 10 — Streaming Updates (SSE):** Backend updates the database and emits real-time suggestions through `AiStreamService` proxied to the client's `EventSource` listener.
12. **Step 11 — Contact Form Emails:** Visitors submit messages to portfolio owners, dispatched via Nodemailer over Gmail SMTP.
13. **Step 12 — Portfolio Intelligence Evaluation:** Portfolio Backend queries Portfolio Intelligence DRL Service (`http://localhost:8001/api/intelligence/evaluate`), returning cached or real-time XGBoost ATS scores, TreeSHAP impact features, and k-NN skill recommendations.
14. **Step 13 — Dynamic DRL Layout Policy & Closed-Loop Telemetry:** Public visitors fetch LinUCB contextual layout decisions (`/api/portfolio/public/layout-policy/:username`) tailored to referrer and device. On unload, interaction telemetry beacons (`/api/portfolio/telemetry`) update bandit matrices online in sub-millisecond Sherman-Morrison rank-1 updates.

---

[Explore System Architecture Overview ➔](Architecture-Overview)
