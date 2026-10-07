import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_health_endpoint_always_public():
    """Ensure /health is always accessible without any credentials (required by cron-job.org)."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_protected_endpoint_rejects_missing_secret(monkeypatch):
    """Ensure /api/ml/* routes reject requests when INTERNAL_SECRET is set but header is missing."""
    monkeypatch.setattr(settings, "INTERNAL_SECRET", "test_production_secret_key_123")
    res = client.post("/api/ml/enhance", json={"text": "A passionate developer building scalable distributed systems."})
    assert res.status_code == 403
    assert "Direct access to this service is forbidden" in res.json()["detail"]

def test_protected_endpoint_accepts_valid_secret(monkeypatch):
    """Ensure /api/ml/* routes allow requests with the matching X-Internal-Secret header."""
    monkeypatch.setattr(settings, "INTERNAL_SECRET", "test_production_secret_key_123")
    res = client.post(
        "/api/ml/recommend-theme",
        json={"industry": "Engineering", "skills": ["Python", "FastAPI"]},
        headers={"X-Internal-Secret": "test_production_secret_key_123"},
    )
    assert res.status_code == 200
    assert "template" in res.json()
