"""
ATS & Portfolio Quality Scoring Engine with SHAP Feature Attribution.
Runs XGBoost inference and computes exact additive local Shapley values.
"""

from typing import Dict, Any, List, Tuple
import numpy as np
from app.core.model_loader import model_registry
from app.services.feature_extractor import extract_portfolio_features

FEATURE_ADVICE_MAP = {
    "f01_word_count": {
        "positive": "Optimal detail depth across career history and projects.",
        "negative": "Content is too brief; elaborate on responsibilities and project architecture."
    },
    "f02_action_verb_count": {
        "positive": "Strong leadership verbs drive high impact in bullet points.",
        "negative": "Too few dynamic action verbs; use words like 'Architected', 'Spearheaded', 'Engineered'."
    },
    "f04_metric_count": {
        "positive": "Excellent quantifiable business results (percentages, latency, throughput).",
        "negative": "Lacks quantified impact numbers. Add measurable metrics like '% latency cut' or '$ saved'."
    },
    "f05_metric_density": {
        "positive": "High frequency of measurable outcomes per achievement bullet.",
        "negative": "Bullet points read as task lists rather than measurable achievements."
    },
    "f06_flesch_reading_ease": {
        "positive": "Clean, highly readable prose that recruiters can parse in under 30 seconds.",
        "negative": "Complex phrasing may cause recruiter fatigue; shorten sentences for clarity."
    },
    "f08_skill_count": {
        "positive": "Comprehensive skill portfolio meeting industry standards.",
        "negative": "Skill inventory is sparse; include modern frameworks, databases, and tools."
    },
    "f09_expert_skill_ratio": {
        "positive": "Clear senior depth demonstrated in core engineering proficiencies.",
        "negative": "Consider highlighting key technologies where you possess Expert-level mastery."
    },
    "f12_project_link_ratio": {
        "positive": "Accessible live demo deployments boost portfolio credibility.",
        "negative": "Multiple projects lack live demo / deployed URLs. Host demos on Vercel/Render."
    },
    "f13_project_repo_ratio": {
        "positive": "Verifiable GitHub repository links allow recruiters to review clean code.",
        "negative": "Missing public repository links; attach GitHub links to show implementation quality."
    },
    "f14_project_skill_cohesion": {
        "positive": "High cohesion: listed technologies are actively proven in project descriptions.",
        "negative": "Disconnected skills: list technologies explicitly inside project descriptions."
    },
    "f23_tech_breadth_score": {
        "positive": "Well-rounded full-stack competency across Frontend, Backend, Database, and DevOps.",
        "negative": "Narrow tech breadth; expanding into Docker/Cloud or databases will improve market fit."
    }
}


def score_to_grade(score: float) -> str:
    """Maps continuous 0-100 score to standardized academic/recruiting grade."""
    if score >= 92.0:
        return "A+"
    elif score >= 86.0:
        return "A"
    elif score >= 80.0:
        return "A-"
    elif score >= 75.0:
        return "B+"
    elif score >= 70.0:
        return "B"
    elif score >= 60.0:
        return "C"
    else:
        return "D"


def evaluate_portfolio(portfolio_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates developer portfolio JSON, producing predicted score, grade, and SHAP waterfall insights.
    """
    if not model_registry.is_loaded:
        model_registry.load_artifacts()

    # 1. Feature Extraction
    features, meta = extract_portfolio_features(portfolio_dict)
    X_input = features.reshape(1, -1)

    # 2. XGBoost Prediction
    raw_pred = float(model_registry.ats_model.predict(X_input)[0])
    ats_score = round(float(np.clip(raw_pred, 35.0, 99.0)), 1)
    grade = score_to_grade(ats_score)

    # 3. Local SHAP Attribution
    shap_explanations = []
    try:
        shap_values = model_registry.shap_explainer(X_input)
        values = shap_values.values[0] if hasattr(shap_values, "values") else shap_values[0]

        # Pair feature names with their local impact values
        feature_names = model_registry.feature_names
        impacts = []
        for i, val in enumerate(values):
            fname = feature_names[i] if i < len(feature_names) else f"feature_{i}"
            impacts.append((fname, float(val)))

        # Sort by absolute impact magnitude
        impacts.sort(key=lambda x: abs(x[1]), reverse=True)

        for fname, val in impacts[:6]:  # Top 6 most impactful signals
            direction = "positive" if val >= 0 else "negative"
            advice_dict = FEATURE_ADVICE_MAP.get(fname, {})
            advice = advice_dict.get(
                direction,
                f"Feature contributes {val:+.1f} points to overall score."
            )

            # Human-friendly feature label
            clean_label = fname.split("_", 1)[-1].replace("_", " ").title()

            shap_explanations.append({
                "feature": clean_label,
                "impact": round(val, 1),
                "direction": direction,
                "advice": advice
            })
    except Exception as e:
        shap_explanations.append({
            "feature": "Model Baseline",
            "impact": 0.0,
            "direction": "positive",
            "advice": f"Calculated based on trained regression weights ({e})"
        })

    return {
        "ats_score": ats_score,
        "grade": grade,
        "readability_index": meta["readability_index"],
        "metric_density": meta["metric_density"],
        "action_verb_ratio": meta["action_verb_ratio"],
        "shap_explanations": shap_explanations
    }
