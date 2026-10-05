import pytest
from app.schemas.enhance import EnhanceRequest, EnhanceResponse
from app.schemas.theme import ThemeRecommendationRequest, ThemeRecommendationResponse
from app.schemas.resume import ResumeParseResponse, SkillItem

def test_enhance_schemas():
    req = EnhanceRequest(text="Built an awesome web app with React.")
    assert len(req.text) > 5

    res = EnhanceResponse(original="test", enhanced="enhanced test")
    assert res.original == "test"
    assert res.enhanced == "enhanced test"

def test_theme_schemas():
    req = ThemeRecommendationRequest(industry="FinTech", skills=["Python", "SQL"])
    assert req.industry == "FinTech"
    assert len(req.skills) == 2

    res = ThemeRecommendationResponse(
        template="Minimalist",
        themeColor="ocean",
        fontFamily="inter",
        borderRadius="rounded",
        sectionOrder=["about", "skills", "projects"]
    )
    assert res.template == "Minimalist"
    assert len(res.sectionOrder) == 3

def test_resume_schemas():
    res = ResumeParseResponse(
        title="Full Stack Developer",
        description="Experienced engineer.",
        skills=[SkillItem(name="React", level="Expert", category="Frontend")]
    )
    assert res.title == "Full Stack Developer"
    assert len(res.skills) == 1
    assert res.skills[0].name == "React"
    assert res.portfolioLinks.github == ""
