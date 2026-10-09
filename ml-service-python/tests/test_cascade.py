import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.llm_client import llm_client, extract_json_from_text

client = TestClient(app)

def test_cascade_active_providers():
    """Verify that multiple providers are detected and initialized."""
    active = llm_client.get_active_providers()
    if not active:
        pytest.skip("No live LLM provider keys configured in this environment.")
    assert "groq" in active
    assert "openrouter" in active
    assert "gemini" in active
    assert llm_client.is_configured() is True

def test_health_reports_active_providers():
    """Verify that the /health endpoint includes provider telemetry."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "active_providers" in data
    if not data["active_providers"]:
        pytest.skip("No live LLM provider keys configured in this environment.")
    assert "groq" in data["active_providers"]
    assert data["primary_provider"] == llm_client.primary_provider

def test_extract_json_resilience():
    """Verify that extract_json_from_text handles markdown fences, think tags, and conversational prefixes."""
    # 1. Clean JSON
    assert extract_json_from_text('{"status": "ok"}') == {"status": "ok"}

    # 2. Markdown fence
    raw_md = '```json\n{"message": "hello", "code": 200}\n```'
    assert extract_json_from_text(raw_md) == {"message": "hello", "code": 200}

    # 3. Conversational wrapper with <think> tag
    raw_reasoning = (
        '<think>User wants status ok.</think>\n'
        'Here is your JSON response:\n'
        '```json\n{"status": "ok", "items": [1, 2]}\n```\nHope this helps!'
    )
    assert extract_json_from_text(raw_reasoning) == {"status": "ok", "items": [1, 2]}

def test_live_groq_json_generation():
    """Verify that live LLM generation through Groq works and returns structured JSON."""
    if not llm_client.is_configured():
        pytest.skip("No live LLM provider keys configured in this environment.")
    result = llm_client.generate_json("Output a JSON object with key 'ping' and value 'pong'.")
    assert isinstance(result, dict)
    assert "ping" in result
    assert result["ping"].lower() == "pong"

def test_cascade_fallback_on_groq_failure():
    """Verify that if Groq fails (e.g. 429 rate limit), the cascade seamlessly falls back to OpenRouter/Gemini."""
    if not llm_client.is_configured():
        pytest.skip("No live LLM provider keys configured in this environment.")
    groq_provider = llm_client.get_provider("groq")
    assert groq_provider is not None
    # Simulate Groq failure
    with patch.object(groq_provider, "generate", side_effect=Exception("Rate limit 429 simulated")):
        # The cascade should catch this and successfully call OpenRouter / Gemini
        result = llm_client.generate_content("Say hello in one word", json_mode=False)
        assert len(result) > 0

