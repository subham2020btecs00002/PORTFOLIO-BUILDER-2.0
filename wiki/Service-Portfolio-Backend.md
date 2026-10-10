# 💼 Microservice 3: Portfolio Backend (Port 5000)

The **Portfolio Backend** is a NestJS microservice serving as the core domain and business logic engine. It manages portfolio data structures, dynamic slug routing, contact inquiries, visitor analytics, Server-Sent Events (SSE) AI streaming, and integration with the Python ML Service.

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
            ┌────────────────────────────┬───────┴────────────────────┬────────────────────────────┐
            ▼                            ▼                            ▼                            ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│     Portfolio CRUD     │  │    Public Slug & SEO   │  │  AI Resume & Stream    │  │ Contact Form & Mailer  │
│• Personal Details      │  │• GET /public/:slug     │  │• Multipart PDF Upload  │  │• Visitor inquiries     │
│• Experiences & Projects│  │• Public view counter   │  │• Calls ML Service :8000│  │• Nodemailer via Gmail  │
│• Skills & Education    │  │• Analytics tracking    │  │• AiStreamService (SSE) │  │• In-app contact inbox  │
│• 11 Template Configs   │  │• Download stats        │  │  /ai/stream/:userId    │  │                        │
└───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘  └───────────┬────────────┘
            │                           │                           │                           │
            └───────────────────────────┴─────────────┬─────────────┴───────────────────────────┘
                                                      ▼
                                       ┌─────────────────────────────┐
                                       │     MongoDB Atlas Cluster   │
                                       │(Portfolio, Contact, Stats)  │
                                       └─────────────────────────────┘
```

1. **Portfolio Domain Management:** Full CRUD operations for developer portfolios with validation and schema normalization.
2. **Dynamic Slug Routing:** Generates and validates unique, SEO-friendly custom slugs (e.g., `/p/johndoe`) that resolve portfolios publicly without requiring user authentication.
3. **ML Service Orchestration:**
   - Proxies resume uploads (`POST /api/portfolio/parse-resume`) to the Python ML Service (`/api/ml/parse-resume`).
   - Forwards bio and bullet-point enhancements (`POST /api/portfolio/enhance-bio`) to the Python ML Service (`/api/ml/enhance`).
4. **Server-Sent Events (`AiStreamService`):** Emits real-time SSE recommendations to the client UI over `/api/portfolio/ai/stream/:userId`.
5. **Contact Inquiry Pipeline:** Processes messages sent by recruiters or portfolio visitors, saving them to the database and sending instant notification emails to the portfolio owner using Nodemailer.
6. **Analytics Tracking:** Automatically records portfolio view counts, resume download counts, and external project click-throughs.

---

## 📊 Database Schemas

### 1. `Portfolio` Schema (`src/portfolio/schemas/portfolio.schema.ts`)
| Field | Type | Description |
|---|---|---|
| `userId` | `ObjectId` | Indexed reference to the owning user in the Auth database |
| `slug` | `String` | Unique, URL-safe slug for public access (`index: true, unique: true`) |
| `personalInfo` | `Object` | Full name, professional headline, summary bio, avatar URL, location, phone, social links |
| `skills` | `Array` | Categorized skills (Languages, Frameworks, Cloud, Databases, Tools) with proficiency |
| `experiences` | `Array` | Work history (company, position, start/end dates, location, bullet achievements) |
| `projects` | `Array` | Portfolio projects (title, description, tech stack tags, live URL, GitHub URL, preview image) |
| `education` | `Array` | Institutions, degrees, GPA/grades, graduation dates |
| `certifications`| `Array` | Industry certifications, issuing organizations, credential links |
| `templateId` | `String` | Chosen theme identifier (e.g., `dev-terminal`, `minimalist`, `bento-grid`, `gamified-rpg`) |
| `themeConfig` | `Object` | Custom colors, primary/secondary accents, font families, dark/light toggle |
| `seoMetadata` | `Object` | Meta title, meta description, OpenGraph preview image |
| `isPublic` | `Boolean` | Controls whether the portfolio is visible to the public (`default: true`) |

### 2. `ContactMessage` Schema (`src/contact/schemas/contact.schema.ts`)
| Field | Type | Description |
|---|---|---|
| `portfolioId` | `ObjectId` | Target portfolio receiving the inquiry |
| `senderName` | `String` | Name of recruiter or visitor |
| `senderEmail`| `String` | Contact email address |
| `subject` | `String` | Message subject line |
| `message` | `String` | Detailed message text |
| `isRead` | `Boolean` | Read/unread status in portfolio owner's dashboard |

---

## 📡 API Endpoints Specification

### 1. Portfolio Management
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/portfolio/me` | Yes (`x-user-id`) | Fetch active user's portfolio draft |
| `POST`| `/api/portfolio` | Yes (`x-user-id`) | Create a new portfolio |
| `PUT` | `/api/portfolio/:id` | Yes (`x-user-id`) | Update existing portfolio |
| `DELETE`| `/api/portfolio/:id` | Yes (`x-user-id`) | Delete portfolio |
| `GET` | `/api/portfolio/public/:slug` | **Public** | Public resolution of a portfolio by slug (increments view counter) |

### 2. AI & Resume Extraction
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/portfolio/parse-resume` | Yes | Upload multipart PDF resume; parses and returns structured portfolio draft |
| `POST` | `/api/portfolio/enhance-bio` | Yes | Enhances bio text or experience bullet points using STAR methodology |
| `GET` | `/api/portfolio/ai/stream/:userId` | Yes | Server-Sent Events (SSE) stream delivering real-time recommendation events |

### 3. Contact Form & Analytics
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contact/:portfolioId` | **Public** | Submit a contact form message (sends email alert to owner) |
| `POST` | `/api/portfolio/analytics/:slug/download` | **Public** | Record a resume download event |
| `GET` | `/api/admin/metrics` | Admin Only | System-wide statistics (total portfolios, total users, views) |

---

## 🔐 Environment Variables Specification

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `PORT` | Number | No | `5000` (or `10000` in prod) | HTTP listening port |
| `MONGO_URI` | String | Yes | — | MongoDB Atlas connection string |
| `INTERNAL_SECRET` | String | Yes | — | Shared secret verified by `InternalAuthGuard` |
| `GATEWAY_URL` | String | No | `http://localhost:3001` | Gateway URL for reverse links |
| `ML_SERVICE_URL` | String | Yes | `http://localhost:8000` | Address of the Python ML Service |
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
