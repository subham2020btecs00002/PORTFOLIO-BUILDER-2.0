## 🚀 Overview
This PR adds comprehensive, production-grade documentation for Portfolio Builder 2.0 to the repository and configures an automated GitHub Wiki synchronization workflow. It documents the overall 4-zone architecture, microservices design, React frontend with 11 dynamic templates, and the 5-stage automated CI/CD pipeline.

---

## 📚 What Was Added

### 1. 📖 Full Wiki Documentation Suite (`wiki/`)
- **System Architecture & Visual Diagram**:
  - `Architecture-Overview.md`: Explains the 4 operational zones (Client, Gateway, Internal Services, Databases/External), sequence diagrams, `x-internal-secret` perimeter defense, and transition from RabbitMQ to direct HTTP/SSE streaming.
  - `Architecture-Daigram.md`: High-resolution diagram visual walkthrough matching the visual blueprint and `portfolio_architecture.drawio`.
- **Microservices Deep Dive**:
  - `Service-API-Gateway.md`: NestJS Gateway (Port 3001), rate limiting, JWT token validation, correlation ID tracing (`x-correlation-id`), proxy mapping, and header injection.
  - `Service-Auth.md`: NestJS Auth (Port 5001), `User` schema, bcrypt password hashing, dual-token HttpOnly cookies, and Gmail SMTP verification workflows.
  - `Service-Portfolio-Backend.md`: NestJS Portfolio (Port 5000), schemas (`Portfolio`, `ContactMessage`, `Analytics`), public slug resolution (`/p/:slug`), and Server-Sent Events (`AiStreamService`).
  - `Service-ML-Python.md`: FastAPI (Port 8000), multi-LLM fallback cascade (Groq Llama 3.3, OpenRouter, Google Gemini 1.5), PyMuPDF resume parsing, and STAR-format bullet enhancer.
- **Frontend & Templates Showcase**:
  - `Frontend-Architecture-and-Templates.md`: React 18 SPA architecture, `usePortfolioForm` hook, animated resume parser loader, and showcase of all 11 dynamic templates (`DevTerminal`, `GamifiedRPG`, `BentoGrid`, `AcademicLaTeX`, `DarkPro`, `Cyberpunk`, `Neobrutalism`, `ClassicGreen`, `Creative`, `Minimalist`, `ResumePrint`).
- **DevOps & Infrastructure**:
  - `CI-CD-Pipeline-and-DevOps.md`: Full 5-stage GitHub Actions guide, composite actions, and GitHub secrets setup.
  - `Deployment-and-Hosting-Guide.md`: Render Blueprints (`render.yaml`), Vercel SPA routing (`vercel.json`), MongoDB Atlas configuration, and production environment variables.
- **Developer Guide & API Reference**:
  - `Local-Development-Setup.md`: Port matrix, local `.env` templates, startup scripts, and pre-commit verification commands.
  - `API-Reference.md`: Consolidated REST API catalog with routes, auth requirements, request/response JSON schemas, and error codes.

---

### 2. 🤖 Automated Wiki Sync Workflow (`.github/workflows/wiki-sync.yml`)
- Automates syncing from the codebase `wiki/**` directory to the live GitHub Wiki repository (`PORTFOLIO-BUILDER-2.0.wiki.git`).
- Automatically triggers on push/merge to `main` when files inside `wiki/**` change.
- Authenticates securely via repository secret `WIKI_PAT`.

---

## 🛠️ Local Verification Run

Verified that all local test suites, linters, and builds pass:

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

---

## ✅ Checklist
- [x] All 14 GitHub Wiki pages authored and published to `PORTFOLIO-BUILDER-2.0.wiki.git`.
- [x] Documentation mirrored into repository `wiki/` directory for version control.
- [x] Added `.github/workflows/wiki-sync.yml` with `WIKI_PAT` token support.
- [x] Root `.env` updated with `GITHUB_PAT` and `WIKI_PAT` (ignored in `.gitignore`).
- [x] Local builds, tests, and linters verified across all 5 services.
