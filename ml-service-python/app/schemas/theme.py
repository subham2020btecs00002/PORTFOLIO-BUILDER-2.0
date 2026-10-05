from pydantic import BaseModel, Field
from typing import List

class ThemeRecommendationRequest(BaseModel):
    industry: str = Field(..., description="The user's primary professional field.")
    skills: List[str] = Field(default_factory=list, description="List of user's core skills.")

class ThemeRecommendationResponse(BaseModel):
    template: str = Field(..., description="Recommended template (e.g., 'Minimalist', 'Creative').")
    themeColor: str = Field(..., description="Recommended theme color variable.")
    fontFamily: str = Field(..., description="Recommended typography choice.")
    borderRadius: str = Field(..., description="Recommended CSS border radius style.")
    sectionOrder: List[str] = Field(..., description="Prioritized section order array.")
