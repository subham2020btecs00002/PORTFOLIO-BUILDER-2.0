"""
Pydantic Schemas for Portfolio Quality & ATS Evaluation.
"""

from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class SkillItem(BaseModel):
    name: str
    level: Optional[str] = "Intermediate"
    category: Optional[str] = ""


class ProjectItem(BaseModel):
    title: str
    description: Optional[str] = ""
    link: Optional[str] = ""
    technologies: Optional[List[str]] = []


class ProfessionalHistoryItem(BaseModel):
    companyName: Optional[str] = ""
    position: Optional[str] = ""
    responsibility: Optional[str] = ""
    yearOfJoining: Optional[str] = None
    yearOfLeaving: Optional[str] = None
    isCurrentEmployee: Optional[bool] = False
    technologies: Optional[List[str]] = []


class EducationItem(BaseModel):
    collegeName: Optional[str] = ""
    degree: Optional[str] = ""
    branch: Optional[str] = ""
    cgpaOrPercentage: Optional[str] = ""
    isCurrentStudent: Optional[bool] = False
    yearOfJoining: Optional[str] = None
    yearOfPassing: Optional[str] = None


class PortfolioEvaluationRequest(BaseModel):
    title: Optional[str] = "Software Engineer"
    fullName: Optional[str] = ""
    description: Optional[str] = ""
    skills: Optional[List[SkillItem]] = []
    projects: Optional[List[ProjectItem]] = []
    professionalHistory: Optional[List[ProfessionalHistoryItem]] = []
    education: Optional[List[EducationItem]] = []


class SHAPExplanation(BaseModel):
    feature: str
    impact: float
    direction: str = Field(description="'positive' boosts score, 'negative' penalizes score")
    advice: str


class SkillRecommendation(BaseModel):
    skill: str
    relevance_score: float
    category: str


class PortfolioEvaluationResponse(BaseModel):
    ats_score: float
    grade: str
    readability_index: float
    metric_density: float
    action_verb_ratio: float
    shap_explanations: List[SHAPExplanation]
    skill_gap_recommendations: List[SkillRecommendation]
    evaluated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
