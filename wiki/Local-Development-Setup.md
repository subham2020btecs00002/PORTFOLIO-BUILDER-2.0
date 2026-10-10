# 💻 Local Development & Setup

This guide provides instructions for setting up and running all Portfolio Builder 2.0 microservices and the frontend on your local development machine.

---

## 📋 System Prerequisites

Ensure you have the following installed on your machine:
- **Node.js:** v18.16.0 or higher (recommended: v20 LTS)
- **npm:** v9.0.0 or higher
- **Python:** v3.11 or higher
- **MongoDB:** Local instance running on `localhost:27017` or a cloud MongoDB Atlas URI
- **Git:** Standard CLI

---

## 🗺️ Service Port & Command Matrix

| Service | Technology | Directory | Port | Dev Start Command |
|---|---|---|---|---|
| **Frontend** | React 18 / Vite | `PORTFOLIO_FRONTEND-main` | `3000` | `npm start` |
| **API Gateway** | NestJS | `api-gateway` | `3001` | `npm run start:dev` |
| **Auth Service** | NestJS | `auth-service` | `5001` | `npm run start:dev` |
| **Portfolio Backend** | NestJS | `portfolio_backend_nestjs` | `5000` | `npm run start:dev` |
| **Python ML Service** | FastAPI / Uvicorn | `ml-service-python` | `8000` | `uvicorn app.main:app --port 8000 --reload` |

---

## 🚀 Step-by-Step Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/subham2020btecs00002/PORTFOLIO-BUILDER-2.0.git
cd PORTFOLIO-BUILDER-2.0
```

### 2. Configure Environment Files

Create `.env` files in each service directory (or duplicate `.env.example` if available):

#### `api-gateway/.env`
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=super-secret-local-jwt-key
INTERNAL_SECRET=super-secret-internal-gateway-token
AUTH_SERVICE_URL=http://localhost:5001
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

#### `auth-service/.env`
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/portfolio_builder
JWT_SECRET=super-secret-local-jwt-key
JWT_REFRESH_SECRET=super-secret-local-refresh-jwt-key
INTERNAL_SECRET=super-secret-internal-gateway-token
GATEWAY_URL=http://localhost:3001
EMAIL=your-email@gmail.com
PASSWORD=your-google-app-password
```

#### `portfolio_backend_nestjs/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/portfolio_builder
INTERNAL_SECRET=super-secret-internal-gateway-token
ML_SERVICE_URL=http://localhost:8000
EMAIL=your-email@gmail.com
PASSWORD=your-google-app-password
```

#### `ml-service-python/.env`
```env
PORT=8000
GROQ_API_KEY=gsk_your_groq_key
OPENROUTER_API_KEY=sk-or-your_openrouter_key
GEMINI_API_KEY=AIzaSy_your_gemini_key
```

#### `PORTFOLIO_FRONTEND-main/.env`
```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

---

### 3. Install Dependencies & Launch Services

Open separate terminal windows for each service:

```bash
# Terminal 1: Python ML Service
cd ml-service-python
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload

# Terminal 2: Auth Service
cd auth-service
npm install
npm run start:dev

# Terminal 3: Portfolio Backend
cd portfolio_backend_nestjs
npm install
npm run start:dev

# Terminal 4: API Gateway
cd api-gateway
npm install
npm run start:dev

# Terminal 5: Frontend React SPA
cd PORTFOLIO_FRONTEND-main
npm install
npm start
```

Visit **http://localhost:3000** in your web browser.

---

## 🧪 Pre-Commit Local Verification

Run these verification commands across all services before committing code to ensure the automated GitHub Actions pipeline succeeds on first push:

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

[Explore Unified API Reference ➔](API-Reference)
