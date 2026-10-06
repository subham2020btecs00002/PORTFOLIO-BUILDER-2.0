---
title: Portfolio ML Service
emoji: 🧠
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
---

# Portfolio ML Service (FastAPI)

Production microservice for resume parsing, portfolio text polishing, and theme generation powered by Google Gemini and FastAPI.

## Endpoints
- `GET /health` - Service health verification
- `POST /api/ml/enhance` - AI text and bullet point polishing
- `POST /api/ml/theme` - Portfolio theme recommendations
- `POST /api/ml/parse-resume` - PDF resume text extraction and structured parsing
