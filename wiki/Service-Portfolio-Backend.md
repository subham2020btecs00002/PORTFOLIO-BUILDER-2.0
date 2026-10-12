# 💼 Microservice 3: Portfolio Backend (Port 5000)

The **Portfolio Backend** is a NestJS microservice serving as the core business logic and domain engine for Portfolio Builder 2.0. It manages portfolio data structures, custom username slugs, visitor analytics, Server-Sent Events (SSE) AI streaming, and orchestration with both the Python ML Service (Port 8000) and Portfolio Intelligence DRL Service (Port 8001).

---

## 🎯 Core Responsibilities

```
                                  ┌─────────────────────────────┐
                                  │  API Gateway (:3001) Ingress│
                                  └──────────────┬──────────────┘
                                                 │ (x-internal-secret + x-user-id)
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │      InternalAuthGuard      │
                                  └──────────────┬──────────────┘
                                                 │
            ┌────────────────────────────┼────────────────────────────┬────────────────────────────┐
            ▼                            ▼                            ▼                            ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│     Portfolio CRUD     │  │    Public Slug & SEO   │  │  Generative AI & SSE   │  │ Portfolio Intelligence │
│• Personal Details      │  │• GET /public/by-       │  │• Multipart PDF Upload  │  │• Calls DRL :8001       │
│• Experiences & Projects│  │  username/:username    │  │• Calls ML Service :8000│  │• XGBoost ATS Caching   │
│• Skills & Education    │  │• Public view counter   │  │• AiStreamService (SSE) │  │• LinUCB Layout Policy  │
│• 11 Template Configs   │  │• Download stats        │  │  /ai/stream/:userId    │  │• Closed-Loop Telemetry │
└───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘
            │                           │                           │                           │
            └───────────────────────────┴─────────────┬─────────────┴───────────────────────────┘
                                                      │
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │     MongoDB Atlas Cluster   │
                                       │(Portfolios, Messages, Stats)│
                                       └─────────────────────────────┘
```

1. **Portfolio Domain Management:** Full CRUD operations for developer portfolios with validation, file upload handling, and schema normalization.
2. **Dynamic Slug Routing:** Resolves public portfolios by custom usernames (`/p/:username`) without requiring user authentication.
3. **ML Service Orchestration (Port 8000):**
   - Proxies resume uploads (`POST /api/portfolio/ai/parse-resume`) to the Python ML Service (`/api/ml/parse-resume`).
   - Forwards bio and bullet-point enhancements (`POST /api/portfolio/ai/enhance`) to the Python ML Service (`/api/ml/enhance`).
4. **Portfolio Intelligence DRL Orchestration (Port 8001):**
   - Implemented via `IntelligenceClientService` (`src/portfolio/intelligence-client.service.ts`).
   - Evaluates portfolios on demand with XGBoost ATS scoring and TreeSHAP feature attributions, caching results in MongoDB.
   - Computes dynamic LinUCB Contextual Bandit layout policies (`POST /api/portfolio/public/layout-policy/:username`) based on visitor context (referrer, device, hour).
   - Ingests closed-loop visitor telemetry (`POST /api/portfolio/telemetry`) to update bandit reward models online.
5. **Server-Sent Events (`AiStreamService`):** Emits real-time SSE recommendations to the client UI over `/api/portfolio/ai/stream/:userId`.
6. **Contact Inquiry Pipeline:** Processes messages sent by recruiters or portfolio visitors, saving them to the database and sending instant notification emails to the portfolio owner using Nodemailer via Gmail SMTP.
7. **Analytics Tracking:** Automatically records portfolio view counts, resume download counts, and external project click-throughs.

---

## 📊 Database Schemas

### 1. `Portfolio` Schema (`src/portfolio/schemas/portfolio.schema.ts`)
| Field | Type | Description |
|---|---|---|
| `userId` | `ObjectId` | Indexed reference to the owning user in the Auth database |
| `username` | `String` | Unique, URL-safe slug for public access (`index: true, unique: true`) |
| `personalInfo` | `Object` | Full name, professional headline, summary bio, avatar URL, location, phone, social links |
| `skills` | `Array` | Categorized skills (Languages, Frameworks, Cloud, Databases, Tools) with proficiency |
| `experiences` | `Array` | Work history (company, position, start/end dates, location, bullet achievements) |
| `projects` | `Array` | Portfolio projects (title, description, tech stack tags, live URL, GitHub URL, preview image) |
| `education` | `Array` | Institutions, degrees, GPA/grades, graduation dates |
| `certifications`| `Array` | Industry certifications, issuing organizations, credential links |
| `templateId` | `String` | Chosen theme identifier (e.g., `dev-terminal`, `minimalist`, `bento-grid`, `gamified-rpg`) |
| `themeConfig` | `Object` | Custom colors, primary/secondary accents, font families, dark/light toggle |
| `intelligenceEvaluation` | `Object` | Cached XGBoost ATS score, grade, readability index, metric density, action verb ratio, SHAP explanations, skill gap suggestions |
| `pdfResume` | `Buffer / Binary` | Inlined binary PDF file buffer for zero-storage external hosting |
| `avatarImage` | `Buffer / Binary` | Inlined binary avatar image buffer |
| `views` | `Number` | Total public page views |
| `downloads` | `Number` | Total resume PDF downloads |
| `contactCount` | `Number` | Total contact submissions received |

---

## 📡 API Endpoints Specification

### 1. Portfolio Management
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/portfolio` | Yes (`x-user-id`) | Fetch active user's portfolio draft |
| `GET` | `/api/portfolio/exists` | Yes (`x-user-id`) | Check if active user has created a portfolio |
| `POST`| `/api/portfolio` | Yes (`x-user-id`) | Create portfolio with multipart `pdf` & `avatar` |
| `PUT` | `/api/portfolio` | Yes (`x-user-id`) | Update existing portfolio |
| `DELETE`| `/api/portfolio` | Yes (`x-user-id`) | Delete user portfolio |
| `GET` | `/api/portfolio/public/by-username/:username` | **Public** | Public resolution of a portfolio by username (increments view counter) |
| `GET` | `/api/portfolio/public/:userId` | **Public** | Public resolution by MongoDB user ID (internal / legacy support) |
| `GET` | `/api/portfolio/download/:id` | **Public** | Download user resume PDF binary |
| `GET` | `/api/portfolio/avatar/:id` | **Public** | Stream user avatar image binary |
| `GET` | `/api/portfolio/analytics` | Yes (`x-user-id`) | Fetch owner analytics (views, downloads, contacts) |

### 2. Generative AI & Resume Extraction
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/portfolio/ai/parse-resume` | Yes | Upload multipart PDF resume; parses into structured portfolio draft (daily rate-limited) |
| `POST` | `/api/portfolio/ai/enhance` | Yes | Enhances bio text or experience bullet points using STAR methodology |
| `POST` | `/api/portfolio/ai/recommendations` | Yes | Triggers AI recommendations generation |
| `GET` | `/api/portfolio/ai/usage` | Yes | Fetch daily AI parser usage quota |
| `DELETE`| `/api/portfolio/ai/recommendations` | Yes | Clear saved recommendations |
| `GET` | `/api/portfolio/ai/stream/:userId` | Yes | Server-Sent Events (SSE) stream delivering real-time recommendations |

### 3. Portfolio Intelligence & DRL Engine
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/portfolio/intelligence/evaluation` | Yes | Retrieve cached or real-time XGBoost ATS score, SHAP attributions, and k-NN skill gaps |
| `POST` | `/api/portfolio/intelligence/evaluate` | Yes | Force recalculation of intelligence evaluation via DRL microservice |
| `POST` | `/api/portfolio/public/layout-policy/:username` | **Public** | Contextual Bandit LinUCB decision selecting optimal layout for visitor context |
| `POST` | `/api/portfolio/telemetry` | **Public** | Ingest visitor interaction beacon to update LinUCB bandit weights online |

### 4. Contact Form & Analytics
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contact` | **Public** | Submit a contact form message (sends email alert to owner and increments contact count) |
| `POST` | `/api/portfolio/analytics/:slug/download` | **Public** | Record a resume download event |

### 5. Admin Controls
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin Only | System-wide statistics (portfolios, users, views, downloads) |
| `GET` | `/api/admin/users` | Admin Only | Directory search across all users and portfolio states |
| `PUT` | `/api/admin/users/:userId/role` | Admin Only | Update user role (`user` or `admin`) |
| `DELETE` | `/api/admin/users/:userId` | Admin Only | Delete user account and cascade delete portfolio |
| `DELETE` | `/api/admin/users/:userId/portfolio` | Admin Only | Delete user portfolio |

---

## 🔐 Environment Variables Specification

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | Number | No | `5000` (or `10000` in prod) | HTTP listening port |
| `MONGO_URI` | String | Yes | — | MongoDB Atlas connection string |
| `INTERNAL_SECRET` | String | Yes | — | Shared secret verified by `InternalAuthGuard` |
| `GATEWAY_URL` | String | No | `http://localhost:3001` | Gateway URL for reverse links |
| `ML_SERVICE_URL` | String | Yes | `http://localhost:8000` | Address of the Python ML Service |
| `INTELLIGENCE_SERVICE_URL` | String | Yes | `http://localhost:8001` | Address of the Portfolio Intelligence DRL Service |
| `EMAIL` | String | Yes | — | Gmail sender account for contact emails |
| `PASSWORD` | String | Yes | — | Google App Password |
| `RECEIVER_EMAIL` | String | No | — | Fallback system email |

---

## 🛠️ Verification & Testing Commands

```bash
# Navigate to Portfolio Backend directory
cd portfolio_backend_nestjs

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run linter
npm run lint

# Start development server
npm run start:dev
```

---

[Explore Python ML Service ➔](Service-ML-Python)
