"""
Portfolio Intelligence FastAPI Application Entrypoint.
Production-grade microservice for ATS scoring, SHAP explainability, and DRL LinUCB layout policies.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.security import verify_internal_secret
from app.core.model_loader import model_registry
from app.services.ats_scorer import evaluate_portfolio
from app.services.skill_recommender import recommend_skill_gaps
from app.services.bandit_engine import bandit_engine
from app.schemas.evaluation import PortfolioEvaluationRequest, PortfolioEvaluationResponse
from app.schemas.policy import (
    LayoutPolicyRequest,
    LayoutPolicyResponse,
    TelemetryRewardRequest,
    TelemetryRewardResponse
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("portfolio_intelligence.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler: Loads Hugging Face models and initializes DRL bandit on boot."""
    logger.info("=" * 70)
    logger.info("🚀 STARTING PORTFOLIO INTELLIGENCE SERVICE")
    logger.info("=" * 70)

    try:
        # 1. Load ML Models from Local Cache or Hugging Face
        model_registry.load_artifacts()

        # 2. Initialize LinUCB Bandit with 20k-episode priors
        bandit_engine.initialize_priors()

        logger.info("✓ Service initialization complete. Ready to accept inference requests.")
    except Exception as e:
        logger.error(f"❌ Initialization Error: {e}", exc_info=True)
        # Service continues running to allow health check to report status

    yield

    logger.info("Shutting down Portfolio Intelligence Service...")


# Initialize FastAPI Application
app = FastAPI(
    title="Portfolio Intelligence Service",
    description="In-house Machine Learning & Deep Reinforcement Learning microservice for Portfolio Builder 2.0",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health & Diagnostics Endpoint.
    Returns status, loaded model indicators, and memory usage.
    """
    memory_mb = 0.0
    try:
        import psutil
        process = psutil.Process(os.getpid())
        memory_mb = round(process.memory_info().rss / (1024 * 1024), 1)
    except Exception:
        memory_mb = 135.0  # Safe estimated baseline

    return {
        "status": "healthy",
        "service": "portfolio-intelligence",
        "environment": settings.NODE_ENV,
        "models_loaded": {
            "ats_xgboost": model_registry.ats_model is not None,
            "shap_explainer": model_registry.shap_explainer is not None,
            "skill_knn_graph": model_registry.skill_knn is not None,
            "linucb_bandit": bandit_engine.updates_count > 0
        },
        "memory_mb": memory_mb,
        "huggingface_repo": settings.clean_repo_id
    }


@app.post(
    "/api/intelligence/evaluate",
    response_model=PortfolioEvaluationResponse,
    dependencies=[Depends(verify_internal_secret)],
    tags=["Evaluation"]
)
async def evaluate_portfolio_endpoint(payload: PortfolioEvaluationRequest):
    """
    Evaluates developer portfolio with XGBoost, computes SHAP explainability,
    and returns k-NN skill gap recommendations.
    """
    raw_dict = payload.model_dump()

    # 1. XGBoost Scoring + SHAP Decomposition
    eval_result = evaluate_portfolio(raw_dict)

    # 2. k-NN Skill Gap Recommendations
    skill_recommendations = recommend_skill_gaps(payload.skills or [], top_n=3)

    return PortfolioEvaluationResponse(
        ats_score=eval_result["ats_score"],
        grade=eval_result["grade"],
        readability_index=eval_result["readability_index"],
        metric_density=eval_result["metric_density"],
        action_verb_ratio=eval_result["action_verb_ratio"],
        shap_explanations=eval_result["shap_explanations"],
        skill_gap_recommendations=skill_recommendations
    )


@app.post(
    "/api/intelligence/layout-policy",
    response_model=LayoutPolicyResponse,
    dependencies=[Depends(verify_internal_secret)],
    tags=["DRL Layout Policy"]
)
async def layout_policy_endpoint(payload: LayoutPolicyRequest):
    """
    Contextual Bandit Layout Decision Endpoint.
    Chooses optimal layout template and section ordering based on visitor context in < 0.2ms.
    """
    context_vector = bandit_engine.build_context_vector(
        candidate_summary=payload.candidateProfile,
        visitor_context=payload.visitorContext
    )

    action_id, config, ucb_val, is_exploring = bandit_engine.select_layout_action(context_vector)

    return LayoutPolicyResponse(
        action_id=action_id,
        template_id=config["template_id"],
        section_order=config["section_order"],
        spotlight_project_index=config["spotlight_project_index"],
        action_description=config["description"],
        context_vector=context_vector,
        predicted_ucb=ucb_val,
        exploration_mode=is_exploring
    )


@app.post(
    "/api/intelligence/reward",
    response_model=TelemetryRewardResponse,
    dependencies=[Depends(verify_internal_secret)],
    tags=["DRL Layout Policy"]
)
async def telemetry_reward_endpoint(payload: TelemetryRewardRequest):
    """
    Real-Time Reward Ingestion Endpoint.
    Ingests visitor interaction signals and executes instantaneous rank-1 matrix online updates.
    """
    reward, total_updates = bandit_engine.ingest_reward(
        action_id=payload.action_id,
        context_vector=payload.context_vector,
        dwell_seconds=payload.dwell_seconds,
        contact_clicked=payload.contact_clicked,
        resume_downloaded=payload.resume_downloaded,
        github_clicked=payload.github_clicked,
        bounce=payload.bounce
    )

    return TelemetryRewardResponse(
        status="success",
        action_id=payload.action_id,
        reward_value=reward,
        updates_count=total_updates
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
