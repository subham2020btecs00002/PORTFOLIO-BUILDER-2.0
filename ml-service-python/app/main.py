import os
from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List
from app.services import gemini_service, pdf_service

app = FastAPI(
    title="Portfolio Builder ML Service",
    description="Python FastAPI service handling LLM rephrasing and parametric design recommendations.",
    version="1.0.0"
)

# Request validation schemas
class EnhanceRequest(BaseModel):
    text: str = Field(..., min_length=5, description="The raw portfolio text to polish.")

class EnhanceResponse(BaseModel):
    original: str
    enhanced: str

class ThemeRecommendationRequest(BaseModel):
    industry: str = Field(..., description="The user's primary professional field.")
    skills: List[str] = Field(default_factory=list, description="List of user's core skills.")

class ThemeRecommendationResponse(BaseModel):
    template: str
    themeColor: str
    fontFamily: str
    borderRadius: str
    sectionOrder: List[str]

@app.on_event("startup")
def startup_event():
    from app.events.rabbitmq_client import start_background_consumer
    start_background_consumer()

@app.get("/health")
def health_check():
    """Simple service health verification."""
    return {"status": "healthy", "service": "portfolio-ml-service"}

@app.post("/api/ml/enhance", response_model=EnhanceResponse)
def enhance_portfolio_text(payload: EnhanceRequest):
    """
    Polishes and rephrases resume draft sentences or descriptions to make them sound
    industry-grade and professional.
    """
    enhanced = gemini_service.enhance_text(payload.text)
    return EnhanceResponse(original=payload.text, enhanced=enhanced)

@app.post("/api/ml/recommend-theme", response_model=ThemeRecommendationResponse)
def recommend_layout_theme(payload: ThemeRecommendationRequest):
    """
    Analyzes user profession and skill vectors, recommending matching page layouts
    and visual variables.
    """
    recommendation = gemini_service.recommend_theme(payload.industry, payload.skills)
    return ThemeRecommendationResponse(**recommendation)

@app.post("/api/ml/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Extracts raw text from an uploaded resume PDF and parses it
    into a structured portfolio JSON structure.
    """
    file_bytes = await file.read()
    raw_text = pdf_service.extract_text_from_pdf(file_bytes)
    if not raw_text:
        raise HTTPException(status_code=400, detail="Failed to extract text from PDF")
    
    parsed_json = gemini_service.parse_resume_text(raw_text)
    return parsed_json
