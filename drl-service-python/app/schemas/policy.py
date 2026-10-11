"""
Pydantic Schemas for DRL LinUCB Layout Policy & Telemetry Ingestion.
"""

from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class VisitorContext(BaseModel):
    referrer: Optional[str] = "direct"
    device: Optional[str] = "desktop"
    hour: Optional[int] = 12


class CandidateProfileSummary(BaseModel):
    yearsOfExperience: Optional[float] = 3.0
    primaryDomain: Optional[str] = "Backend"
    projectCount: Optional[int] = 3
    skillCount: Optional[int] = 8


class LayoutPolicyRequest(BaseModel):
    candidateProfile: Optional[CandidateProfileSummary] = None
    visitorContext: Optional[VisitorContext] = None


class LayoutPolicyResponse(BaseModel):
    action_id: str
    template_id: str
    section_order: List[str]
    spotlight_project_index: int
    action_description: str
    context_vector: List[float]
    predicted_ucb: float
    exploration_mode: bool
    decided_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TelemetryRewardRequest(BaseModel):
    action_id: str
    context_vector: List[float]
    dwell_seconds: float = 0.0
    contact_clicked: bool = False
    resume_downloaded: bool = False
    github_clicked: bool = False
    bounce: bool = False


class TelemetryRewardResponse(BaseModel):
    status: str = "success"
    action_id: str
    reward_value: float
    updates_count: int
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
