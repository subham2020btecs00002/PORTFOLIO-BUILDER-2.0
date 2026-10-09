from pydantic import BaseModel, Field
from typing import List, Optional

class SkillItem(BaseModel):
    name: str = Field(default="", description="Skill name, e.g. React, Python")
    level: str = Field(default="Intermediate", description="Proficiency: Beginner, Intermediate, Expert")
    category: str = Field(default="Technical", description="Category: Frontend, Backend, DevOps, etc.")

class ProjectItem(BaseModel):
    title: str = Field(default="", description="Project title")
    description: str = Field(default="", description="Brief project overview")
    link: str = Field(default="", description="Project repository or live URL")
    technologies: List[str] = Field(default_factory=list, description="Tech stack tags")

class EducationItem(BaseModel):
    collegeName: str = Field(default="", description="University or College name")
    degree: str = Field(default="", description="Degree title (e.g. B.Tech, M.Tech)")
    branch: str = Field(default="", description="Field of study / branch")
    cgpaOrPercentage: str = Field(default="", description="Academic score (e.g. 8.5 or 85%)")
    isCurrentStudent: bool = Field(default=False, description="Whether currently enrolled / studying here")
    yearOfJoining: str = Field(default="", description="Start date (YYYY-MM-DD)")
    yearOfPassing: str = Field(default="", description="End or graduation date (YYYY-MM-DD)")

class ProfessionalHistoryItem(BaseModel):
    companyName: str = Field(default="", description="Company / Employer name")
    position: str = Field(default="", description="Job title / role")
    responsibility: str = Field(default="", description="Key responsibilities and achievements")
    isCurrentEmployee: bool = Field(default=False, description="Whether currently working here")
    yearOfJoining: str = Field(default="", description="Start date (YYYY-MM-DD)")
    yearOfLeaving: str = Field(default="", description="End date (YYYY-MM-DD)")
    technologies: List[str] = Field(default_factory=list, description="Technologies used in this role")

class PortfolioLinks(BaseModel):
    github: str = Field(default="", description="GitHub profile URL")
    leetcode: str = Field(default="", description="LeetCode profile URL")
    gfg: str = Field(default="", description="GeeksforGeeks profile URL")
    linkedin: str = Field(default="", description="LinkedIn profile URL")

class ResumeParseResponse(BaseModel):
    fullName: str = Field(default="", description="Candidate's full name (preserving First MiddleName LastName)")
    title: str = Field(default="", description="Inferred or extracted professional headline")
    description: str = Field(default="", description="Extracted or generated professional bio")
    skills: List[SkillItem] = Field(default_factory=list, description="Extracted skills")
    projects: List[ProjectItem] = Field(default_factory=list, description="Independent projects")
    education: List[EducationItem] = Field(default_factory=list, description="Education records")
    professionalHistory: List[ProfessionalHistoryItem] = Field(default_factory=list, description="Work experience records")
    portfolioLinks: PortfolioLinks = Field(default_factory=PortfolioLinks, description="Social and coding links")
