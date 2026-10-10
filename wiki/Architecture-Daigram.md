# 🖼️ System Architecture Diagram (Visual Blueprint)

Below is the comprehensive visual architecture diagram for **Portfolio Builder 2.0**, illustrating the client layers, gateway middleware pipeline, internal backend services, external LLM integrations, and persistent databases.

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
| **Multipart File Handler** | FormData / Fetch API | Uploads PDF resumes to parsing endpoints and handles profile avatar crops. |
| **SSE Client Listener** | HTML5 `EventSource` | Subscribes to `/api/portfolio/ai/stream/:userId` for live recommendations. |

---

### 2. API Gateway Zone (Port 3001)
| Node | Technology | Description |
|---|---|---|
| **API Gateway Facade** | NestJS HTTP Gateway | Primary reverse proxy entrypoint on port `3001` (or port `10000` in cloud production). |
| **`RateLimiterMiddleware`** | Express Rate Limit | Enforces request quotas per IP address to safeguard services from abuse. |
| **`JwtVerifyMiddleware`** | `@nestjs/jwt` | Verifies access tokens in cookies/headers and injects `x-user-id` and `x-user-role`. |
| **Proxy Manager** | `http-proxy-middleware` | Injects secret header `x-internal-secret`, rewrites CORS headers, and routes upstream. |

---

### 3. Internal Backend Services Zone
| Node | Technology | Description |
|---|---|---|
| **Auth Service** | NestJS REST (Port 5001) | User entity persistence, credential validation, bcrypt hashing, and email token generation. |
| **Portfolio Monolith Backend** | NestJS REST (Port 5000) | Portfolio CRUD, slug resolution, contact form processing, and analytics aggregation. |
| **`AiStreamService`** | NestJS SSE | Real-time Server-Sent Events emitter streaming AI insights back to the client. |
| **Python ML Service** | FastAPI (Port 8000) | High-performance Python service executing PyMuPDF text parsing and LLM inference. |

---

### 4. Databases & External APIs Zone
| Node | Technology | Description |
|---|---|---|
| **MongoDB Atlas** | Cloud MongoDB Cluster | Stores user credentials, portfolio documents, analytics metrics, and contact inquiries. |
| **Google Gemini API** | LLM Engine | External multimodal/text LLM endpoints (`gemini-1.5-flash`, `gemini-1.5-pro`) for parsing and rephrasing. |
| **Gmail SMTP Server** | Nodemailer Relay | Cloud SMTP mailer used by Auth Service and Portfolio Backend for transactional messages. |
| **Render & Vercel** | Cloud PaaS Infrastructure | Cloud hosting platforms executing backends and serving the static React bundle. |

---

## 🔀 Step-by-Step Flow Execution Map

1. **Step 1 — Inbound HTTP Request:** Client SPA dispatches HTTP request (Auth, Portfolio, or AI) to the API Gateway on port `3001`.
2. **Step 2 — Rate Limiting Check:** `RateLimiterMiddleware` validates request quota.
3. **Step 3 — JWT Verification:** `JwtVerifyMiddleware` decodes token signature. If valid, attaches `x-user-id` and `x-user-role` headers.
4. **Step 4 — Route & Gateway Secret Injection:** `Proxy Manager` injects secret header `x-internal-secret`.
5. **Step 5a — Auth Proxy:** Forwarded to `http://localhost:5001/api/auth/*`.
6. **Step 5b — Portfolio Proxy:** Forwarded to `http://localhost:5000/api/portfolio/*` or `/api/contact/*`.
7. **Step 6a — Auth Database Queries:** Auth Service persists or reads user documents from MongoDB Atlas.
8. **Step 6b — Auth Emails:** Auth Service sends verification or reset emails via Gmail SMTP.
9. **Step 6c — Portfolio DB Operations:** Portfolio Backend reads/writes portfolio schemas and views in MongoDB Atlas.
10. **Step 7 & 8 — AI & ML Inference:** Portfolio Backend invokes Python ML Service (`/api/ml/enhance` or `/api/ml/parse-resume`), which queries Google Gemini / Groq / OpenRouter LLM endpoints.
11. **Step 9 & 10 — Streaming Updates (SSE):** Backend updates the database and emits real-time suggestions through `AiStreamService` proxied to the client's `EventSource` listener.
12. **Step 11 — Contact Form Emails:** Visitors submit messages to portfolio owners, dispatched via Nodemailer over Gmail SMTP.

---

[Explore API Gateway Microservice ➔](Service-API-Gateway)
