from typing import List
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Service health indicator")
    service: str = Field(default="portfolio-ml-service", description="Service name")
    version: str = Field(default="1.0.0", description="Service semantic version")
    active_providers: List[str] = Field(default_factory=list, description="Currently configured LLM providers")
    primary_provider: str = Field(default="", description="Primary active LLM provider")
