from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_enhance_validation_error():
    # Text shorter than 5 chars should return 422 Unprocessable Entity
    res = client.post("/api/ml/enhance", json={"text": "hi"})
    assert res.status_code == 422

def test_theme_recommendation_structure():
    res = client.post("/api/ml/recommend-theme", json={"industry": "Engineering", "skills": ["Python"]})
    assert res.status_code == 200
    data = res.json()
    assert "template" in data
    assert "themeColor" in data
    assert "sectionOrder" in data

def test_resume_missing_file():
    res = client.post("/api/ml/parse-resume")
    assert res.status_code == 422
