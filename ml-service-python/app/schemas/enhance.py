from pydantic import BaseModel, Field

class EnhanceRequest(BaseModel):
    text: str = Field(..., min_length=5, description="The raw portfolio text to polish and rephrase.")

class EnhanceResponse(BaseModel):
    original: str = Field(..., description="The original unpolished text submitted by the user.")
    enhanced: str = Field(..., description="The AI-polished, professional description.")
