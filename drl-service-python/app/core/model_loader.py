"""
Model Registry & Dynamic Hugging Face Hub Loader.
Loads XGBoost, k-NN, LinUCB priors, and SHAP explainer on startup with local caching.
"""

import os
import json
import logging
from typing import Dict, Any, Optional
import joblib
import shap
from huggingface_hub import hf_hub_download
from app.config import settings

logger = logging.getLogger("portfolio_intelligence.model_loader")


class ModelRegistry:
    """Singleton registry holding loaded production models and baseline explainers."""

    def __init__(self):
        self.ats_package: Optional[Dict[str, Any]] = None
        self.ats_model: Optional[Any] = None
        self.shap_explainer: Optional[shap.TreeExplainer] = None
        self.shap_expected_value: float = 65.0
        self.feature_names: list = []

        self.skill_package: Optional[Dict[str, Any]] = None
        self.skill_knn: Optional[Any] = None
        self.skill_taxonomy: list = []

        self.bandit_priors: Optional[Dict[str, Any]] = None
        self.feature_schema: Optional[Dict[str, Any]] = None
        self.is_loaded: bool = False

    def load_artifacts(self) -> bool:
        """Loads all required models from local cache or pulls from Hugging Face Model Hub."""
        artifacts_dir = settings.ARTIFACTS_DIR
        os.makedirs(artifacts_dir, exist_ok=True)

        required_files = [
            "ats_xgboost.joblib",
            "skill_knn.joblib",
            "bandit_priors.json",
            "feature_schema.json"
        ]

        resolved_paths: Dict[str, str] = {}
        repo_id = settings.clean_repo_id

        for fname in required_files:
            local_path = os.path.join(artifacts_dir, fname)

            # Check local file existence first
            if os.path.exists(local_path):
                resolved_paths[fname] = local_path
                logger.info(f"[ModelLoader] Using local artifact: {fname}")
            else:
                logger.info(f"[ModelLoader] Pulling {fname} from Hugging Face: {repo_id}...")
                token = settings.HF_TOKEN if settings.HF_TOKEN else None
                try:
                    pulled_path = hf_hub_download(
                        repo_id=repo_id,
                        filename=fname,
                        token=token,
                        local_dir=artifacts_dir
                    )
                    resolved_paths[fname] = pulled_path
                    logger.info(f"[ModelLoader] Successfully downloaded: {fname}")
                except Exception as e:
                    logger.error(f"[ModelLoader] Failed to download {fname} from Hugging Face: {e}")
                    raise RuntimeError(f"Missing required model artifact {fname}: {e}")

        # 1. Load XGBoost Package & Initialize SHAP TreeExplainer
        logger.info("[ModelLoader] Loading XGBoost ATS Scorer package...")
        self.ats_package = joblib.load(resolved_paths["ats_xgboost.joblib"])
        self.ats_model = self.ats_package["model"]
        self.feature_names = self.ats_package.get("feature_names", [])
        self.shap_expected_value = float(self.ats_package.get("shap_expected_value", 65.0))

        logger.info("[ModelLoader] Pre-initializing SHAP TreeExplainer...")
        self.shap_explainer = shap.TreeExplainer(self.ats_model)

        # 2. Load Skill k-NN Graph Package
        logger.info("[ModelLoader] Loading Skill k-NN Co-occurrence Graph...")
        self.skill_package = joblib.load(resolved_paths["skill_knn.joblib"])
        self.skill_knn = self.skill_package["knn_model"]
        self.skill_taxonomy = self.skill_package.get("taxonomy", [])

        # 3. Load LinUCB Bandit Priors
        logger.info("[ModelLoader] Loading LinUCB DRL Bandit Priors...")
        with open(resolved_paths["bandit_priors.json"], "r", encoding="utf-8") as f:
            self.bandit_priors = json.load(f)

        # 4. Load Feature Schema Definitions
        with open(resolved_paths["feature_schema.json"], "r", encoding="utf-8") as f:
            self.feature_schema = json.load(f)

        self.is_loaded = True
        logger.info("✨ [ModelLoader] All models and baselines loaded successfully into memory!")
        return True


# Global Singleton Instance
model_registry = ModelRegistry()
