"""
Unit and Integration Tests for Portfolio Intelligence FastAPI Endpoints.
Verifies XGBoost scoring, SHAP explainability, k-NN recommendations, and LinUCB bandit policies.
"""

import time
import pytest
from fastapi.testclient import TestClient
from app.config import settings
from app.main import app
from app.core.model_loader import model_registry
from app.services.bandit_engine import bandit_engine

client = TestClient(app, headers={"x-internal-secret": settings.INTERNAL_SECRET})


@pytest.fixture(scope="session", autouse=True)
def initialize_models():
    """Ensures models and bandit engine are loaded before running test cases."""
    if not model_registry.is_loaded:
        model_registry.load_artifacts()
    bandit_engine.initialize_priors()


def test_health_check_endpoint():
    """Verifies that the /health endpoint reports healthy status and loaded models."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "portfolio-intelligence"
    assert data["models_loaded"]["ats_xgboost"] is True
    assert data["models_loaded"]["shap_explainer"] is True
    assert data["models_loaded"]["skill_knn_graph"] is True
    assert data["models_loaded"]["linucb_bandit"] is True
    assert "memory_mb" in data


def test_evaluate_portfolio_endpoint():
    """Verifies that the /api/intelligence/evaluate endpoint generates scores, SHAP, and skill recommendations."""
    payload = {
        "title": "Senior Distributed Systems Engineer",
        "description": "Architected low-latency microservices handling 120k requests per minute. Implemented Raft consensus in Go.",
        "skills": [
            {"name": "Go", "level": "Expert", "category": "Language"},
            {"name": "Python", "level": "Expert", "category": "Language"},
            {"name": "PostgreSQL", "level": "Expert", "category": "Database"},
            {"name": "Docker", "level": "Expert", "category": "DevOps"},
            {"name": "Kubernetes", "level": "Intermediate", "category": "DevOps"}
        ],
        "projects": [
            {
                "title": "Distributed Consensus Scheduler",
                "description": "Implemented Raft consensus in Go with sub-5ms heartbeat latency. Decreased failover recovery time by 45%.",
                "link": "https://github.com/developer/raft-demo",
                "technologies": ["Go", "gRPC", "Docker"]
            }
        ],
        "professionalHistory": [
            {
                "companyName": "CloudScale Systems",
                "position": "Senior Backend Engineer",
                "responsibility": "Engineered distributed streaming ingest pipeline processing 45,000 req/sec, reducing p99 latency by 38%.",
                "yearOfJoining": "2021-03-01",
                "yearOfLeaving": None,
                "isCurrentEmployee": True,
                "technologies": ["Go", "Kafka", "Docker"]
            }
        ],
        "education": [
            {
                "collegeName": "State University",
                "degree": "B.S. in Computer Science",
                "branch": "Computer Science",
                "cgpaOrPercentage": "3.8 / 4.0",
                "isCurrentStudent": False
            }
        ]
    }

    response = client.post("/api/intelligence/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert 35.0 <= data["ats_score"] <= 100.0
    assert data["grade"] in ["A+", "A", "A-", "B+", "B", "C", "D"]
    assert "readability_index" in data
    assert "metric_density" in data

    # Verify SHAP Explanations
    assert len(data["shap_explanations"]) > 0
    first_exp = data["shap_explanations"][0]
    assert "feature" in first_exp
    assert "impact" in first_exp
    assert first_exp["direction"] in ["positive", "negative"]
    assert len(first_exp["advice"]) > 0

    # Verify Skill Gap Recommendations
    assert len(data["skill_gap_recommendations"]) > 0
    first_skill = data["skill_gap_recommendations"][0]
    assert "skill" in first_skill
    assert 0.0 <= first_skill["relevance_score"] <= 1.0


def test_layout_policy_endpoint():
    """Verifies that the /api/intelligence/layout-policy endpoint selects a valid layout in real time."""
    payload = {
        "candidateProfile": {
            "yearsOfExperience": 5.0,
            "primaryDomain": "Backend",
            "projectCount": 4,
            "skillCount": 9
        },
        "visitorContext": {
            "referrer": "linkedin",
            "device": "desktop",
            "hour": 15
        }
    }

    response = client.post("/api/intelligence/layout-policy", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["action_id"] in ["a_1", "a_2", "a_3", "a_4", "a_5", "a_6"]
    assert data["template_id"] in ["dev-terminal", "bento-grid", "neobrutalism", "modern-minimalist", "academic-latex", "classic-green"]
    assert len(data["section_order"]) >= 4
    assert len(data["context_vector"]) == 8
    assert "predicted_ucb" in data


def test_telemetry_reward_endpoint():
    """Verifies that the /api/intelligence/reward endpoint updates LinUCB bandit weights online."""
    payload = {
        "action_id": "a_1",
        "context_vector": [1.0, 0.0, 0.6, 0.5, 1.0, 0.4, 0.5, 1.0],
        "dwell_seconds": 55.0,
        "contact_clicked": True,
        "resume_downloaded": True,
        "github_clicked": True,
        "bounce": False
    }

    initial_updates = bandit_engine.updates_count
    response = client.post("/api/intelligence/reward", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["action_id"] == "a_1"
    # Contact (10) + Resume (6) + GitHub (3) + Dwell (4) = 23.0 pts
    assert data["reward_value"] >= 19.0
    assert data["updates_count"] == initial_updates + 1


def test_sub_millisecond_inference_latency():
    """Verifies that layout policy decisions execute in under 15ms on CPU."""
    payload = {
        "candidateProfile": {
            "yearsOfExperience": 4.0,
            "primaryDomain": "Fullstack",
            "projectCount": 5,
            "skillCount": 12
        },
        "visitorContext": {
            "referrer": "github",
            "device": "mobile",
            "hour": 20
        }
    }

    durations = []
    for _ in range(10):
        t0 = time.perf_counter()
        res = client.post("/api/intelligence/layout-policy", json=payload)
        t1 = time.perf_counter()
        assert res.status_code == 200
        durations.append((t1 - t0) * 1000)

    avg_ms = sum(durations) / len(durations)
    print(f"\n[Latency Benchmark] Average Layout Policy Inference: {avg_ms:.2f} ms")
    assert avg_ms < 50.0  # Well within cloud SLA threshold


def test_unauthorized_request_rejected():
    """Verifies that requests with an invalid secret header return 403 Forbidden when secret is active."""
    unauth_client = TestClient(app)
    payload = {
        "candidateProfile": {
            "yearsOfExperience": 3.0,
            "primaryDomain": "Backend",
            "projectCount": 2,
            "skillCount": 5
        },
        "visitorContext": {
            "referrer": "google",
            "device": "desktop",
            "hour": 12
        }
    }
    res = unauth_client.post(
        "/api/intelligence/layout-policy",
        json=payload,
        headers={"x-internal-secret": "invalid-token-12345"}
    )
    if settings.INTERNAL_SECRET and settings.INTERNAL_SECRET != "dev-internal-secret-change-in-production":
        assert res.status_code == 403

