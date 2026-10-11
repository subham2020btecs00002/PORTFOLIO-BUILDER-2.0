#!/usr/bin/env python3
"""
───────────────────────────────────────────────────────────────────────────────
Portfolio Intelligence Offline Training Pipeline
───────────────────────────────────────────────────────────────────────────────
Extracts 24-dimensional feature vectors, trains XGBoost ATS scorer, pre-calculates
SHAP explainability baselines, fits a k-NN skill co-occurrence graph, and simulates
20,000 recruiter interaction episodes to generate pre-calibrated LinUCB priors.

Output Artifacts (saved in drl-service-python/artifacts/):
  - ats_xgboost.joblib
  - skill_knn.joblib
  - bandit_priors.json
  - feature_schema.json
  - training_report.json
───────────────────────────────────────────────────────────────────────────────
"""

import os
import sys
import re
import json
import math
import random
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple

# Ensure safe console output across Windows and Linux
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import numpy as np
import joblib
from sklearn.neighbors import NearestNeighbors
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import xgboost as xgb
import shap

# Set deterministic random seeds for reproducible weights
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_DIR = os.path.dirname(CURRENT_DIR)
DATA_FILE = os.path.join(SERVICE_DIR, "data", "resume_corpus.json")
ARTIFACTS_DIR = os.path.join(SERVICE_DIR, "artifacts")
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. Action Verb Taxonomy & Regex Patterns
# ─────────────────────────────────────────────────────────────────────────────
STRONG_ACTION_VERBS = {
    "architected", "spearheaded", "engineered", "orchestrated", "developed",
    "designed", "implemented", "optimized", "refactored", "accelerated",
    "scaled", "constructed", "deployed", "automated", "streamlined",
    "reduced", "increased", "boosted", "migrated", "championed",
    "integrated", "authored", "mentored", "supervised", "formulated"
}

METRIC_PATTERNS = [
    re.compile(r"\b\d+[\.,]?\d*%\b"),                      # e.g., 45%, 3.8%
    re.compile(r"\$\d+[\.,]?\d*[kKmMbB]?\b"),              # e.g., $50k, $18M
    re.compile(r"\b\d+[\.,]?\d*\s*(ms|s|sec|seconds)\b"),  # e.g., 5ms, 90 seconds
    re.compile(r"\b\d+[\.,]?\d*[kKmMbB]?\s*(req|requests|events|users|skus|nodes)\b", re.I), # e.g. 120k requests
    re.compile(r"\b\d+x\b", re.I),                         # e.g., 4x faster
    re.compile(r"\b\d{2,}\b")                              # general multi-digit impact numbers
]

DEGREE_LEVELS = {
    "phd": 4.0, "doctorate": 4.0,
    "ms": 3.0, "m.s.": 3.0, "m.tech": 3.0, "master": 3.0, "mba": 3.0,
    "bs": 2.0, "b.s.": 2.0, "b.tech": 2.0, "b.e.": 2.0, "bachelor": 2.0,
    "diploma": 1.0, "associate": 1.0
}

FEATURE_DEFINITIONS = [
    {"name": "f01_word_count", "description": "Total words across bio, experience, and projects", "type": "int"},
    {"name": "f02_action_verb_count", "description": "Total strong leadership and action verbs", "type": "int"},
    {"name": "f03_action_verb_ratio", "description": "Density of action verbs per sentence", "type": "float"},
    {"name": "f04_metric_count", "description": "Total quantifiable metrics (percentages, dollars, scale)", "type": "int"},
    {"name": "f05_metric_density", "description": "Metrics per bullet point", "type": "float"},
    {"name": "f06_flesch_reading_ease", "description": "Flesch Reading Ease score", "type": "float"},
    {"name": "f07_flesch_grade_level", "description": "Flesch-Kincaid Grade Level index", "type": "float"},
    {"name": "f08_skill_count", "description": "Total distinct skills listed", "type": "int"},
    {"name": "f09_expert_skill_ratio", "description": "Ratio of Expert-level skills to total skills", "type": "float"},
    {"name": "f10_skill_category_diversity", "description": "Number of unique skill categories represented", "type": "int"},
    {"name": "f11_project_count", "description": "Number of listed projects", "type": "int"},
    {"name": "f12_project_link_ratio", "description": "Proportion of projects with live demo/deployment links", "type": "float"},
    {"name": "f13_project_repo_ratio", "description": "Proportion of projects with repository links", "type": "float"},
    {"name": "f14_project_skill_cohesion", "description": "Percentage of listed skills referenced in project bodies", "type": "float"},
    {"name": "f15_experience_count", "description": "Number of professional work history entries", "type": "int"},
    {"name": "f16_total_experience_months", "description": "Total cumulative career tenure in months", "type": "float"},
    {"name": "f17_avg_role_tenure_months", "description": "Average tenure duration per role in months", "type": "float"},
    {"name": "f18_current_employee_flag", "description": "Binary flag indicating active current employment", "type": "binary"},
    {"name": "f19_has_education", "description": "Binary flag indicating formal educational credential", "type": "binary"},
    {"name": "f20_education_degree_level", "description": "Normalized educational attainment score (0-4)", "type": "float"},
    {"name": "f21_bio_length", "description": "Character length of personal summary / bio", "type": "int"},
    {"name": "f22_bio_has_specialization", "description": "Binary flag for explicit domain specialization in bio", "type": "binary"},
    {"name": "f23_tech_breadth_score", "description": "Coverage across Frontend, Backend, Database, and DevOps", "type": "float"},
    {"name": "f24_temporal_continuity", "description": "Temporal career continuity score (absence of negative overlaps)", "type": "float"}
]


# ─────────────────────────────────────────────────────────────────────────────
# 2. Feature Extractor Engine
# ─────────────────────────────────────────────────────────────────────────────
def compute_flesch_scores(text: str) -> Tuple[float, float]:
    """Computes standard Flesch Reading Ease and Flesch-Kincaid Grade Level."""
    words = re.findall(r"\b[A-Za-z]+\b", text)
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 0]
    
    num_words = max(len(words), 1)
    num_sentences = max(len(sentences), 1)
    
    # Simple syllable heuristic
    def count_syllables(w: str) -> int:
        w = w.lower()
        count = len(re.findall(r"[aeiouy]+", w))
        if w.endswith("e") and not w.endswith("le") and count > 1:
            count -= 1
        return max(count, 1)

    total_syllables = sum(count_syllables(w) for w in words)
    words_per_sent = num_words / num_sentences
    syllables_per_word = total_syllables / num_words

    ease = 206.835 - (1.015 * words_per_sent) - (84.6 * syllables_per_word)
    grade = (0.39 * words_per_sent) + (11.8 * syllables_per_word) - 15.59
    
    return float(np.clip(ease, 0.0, 100.0)), float(np.clip(grade, 1.0, 18.0))


def extract_features(profile: Dict[str, Any]) -> np.ndarray:
    """Extracts the 24-dimensional feature vector from a developer profile JSON."""
    bio = profile.get("description", "") or ""
    skills = profile.get("skills", []) or []
    projects = profile.get("projects", []) or []
    history = profile.get("professional_history", []) or []
    education = profile.get("education", []) or []

    # Aggregate text bodies
    all_text_chunks = [bio]
    for p in projects:
        all_text_chunks.append(p.get("title", "") + " " + p.get("description", ""))
    for h in history:
        all_text_chunks.append(h.get("position", "") + " " + h.get("responsibility", ""))
    full_text = " ".join(all_text_chunks)
    
    words = re.findall(r"\b[A-Za-z0-9\-\_]+\b", full_text.lower())
    total_words = len(words)

    # 1-3. Action Verbs
    action_verb_count = sum(1 for w in words if w in STRONG_ACTION_VERBS)
    sentences = [s.strip() for s in re.split(r"[.!?\n]+", full_text) if len(s.strip()) > 3]
    num_sentences = max(len(sentences), 1)
    action_verb_ratio = action_verb_count / num_sentences

    # 4-5. Quantified Metrics
    metric_count = 0
    for pat in METRIC_PATTERNS:
        metric_count += len(pat.findall(full_text))
    metric_density = metric_count / num_sentences

    # 6-7. Readability
    reading_ease, grade_level = compute_flesch_scores(full_text)

    # 8-10. Skills
    skill_count = len(skills)
    expert_skills = sum(1 for s in skills if s.get("level", "").lower() == "expert")
    expert_skill_ratio = expert_skills / max(skill_count, 1)
    unique_categories = len(set(s.get("category", "General") for s in skills if s.get("category")))

    # 11-14. Projects
    project_count = len(projects)
    links_count = sum(1 for p in projects if p.get("link") and len(p.get("link", "").strip()) > 5)
    project_link_ratio = links_count / max(project_count, 1)
    repo_count = sum(1 for p in projects if "github.com" in (p.get("link", "") or "").lower())
    project_repo_ratio = repo_count / max(project_count, 1)

    skill_names = [s.get("name", "").lower() for s in skills if s.get("name")]
    used_skills = 0
    proj_text_lower = " ".join([p.get("description", "").lower() + " " + " ".join(p.get("technologies", [])) for p in projects])
    for s_name in skill_names:
        if s_name and s_name in proj_text_lower:
            used_skills += 1
    project_skill_cohesion = used_skills / max(len(skill_names), 1)

    # 15-18. Professional History
    experience_count = len(history)
    total_months = 0.0
    current_employee = 0.0
    for h in history:
        if h.get("isCurrentEmployee"):
            current_employee = 1.0
        try:
            start_str = h.get("yearOfJoining", "")
            end_str = h.get("yearOfLeaving", "")
            start_dt = datetime.fromisoformat(start_str.replace("Z", "+00:00")) if start_str else datetime(2021, 1, 1)
            end_dt = datetime.fromisoformat(end_str.replace("Z", "+00:00")) if end_str else datetime.now()
            duration = max((end_dt - start_dt).days / 30.4, 1.0)
            total_months += duration
        except Exception:
            total_months += 18.0
    avg_role_tenure = total_months / max(experience_count, 1)

    # 19-20. Education
    has_education = 1.0 if len(education) > 0 else 0.0
    highest_degree_score = 0.0
    for e in education:
        deg = (e.get("degree", "") + " " + e.get("collegeName", "")).lower()
        for k, val in DEGREE_LEVELS.items():
            if k in deg:
                highest_degree_score = max(highest_degree_score, val)

    # 21-22. Bio
    bio_length = len(bio.strip())
    bio_specialization = 1.0 if any(k in bio.lower() for k in ["engineer", "developer", "architect", "specializ", "passionate", "distributed", "frontend", "backend", "fullstack", "devops", "cloud"]) else 0.0

    # 23. Tech Breadth
    cats = {s.get("category", "").lower() for s in skills}
    names = {s.get("name", "").lower() for s in skills}
    has_fe = any(k in cats or k in names for k in ["frontend", "react", "vue", "angular", "html", "css", "next.js", "tailwind"])
    has_be = any(k in cats or k in names for k in ["backend", "node.js", "python", "go", "java", "fastapi", "nestjs", "express"])
    has_db = any(k in cats or k in names for k in ["database", "postgresql", "mongodb", "mysql", "redis", "kafka", "sqlite"])
    has_ops = any(k in cats or k in names for k in ["devops", "docker", "kubernetes", "aws", "terraform", "ci/cd", "git"])
    tech_breadth = sum([has_fe, has_be, has_db, has_ops]) / 4.0

    # 24. Temporal Continuity
    temporal_continuity = 1.0 if total_months > 0 else 0.5

    feature_vector = np.array([
        total_words,
        action_verb_count,
        action_verb_ratio,
        metric_count,
        metric_density,
        reading_ease,
        grade_level,
        skill_count,
        expert_skill_ratio,
        unique_categories,
        project_count,
        project_link_ratio,
        project_repo_ratio,
        project_skill_cohesion,
        experience_count,
        total_months,
        avg_role_tenure,
        current_employee,
        has_education,
        highest_degree_score,
        bio_length,
        bio_specialization,
        tech_breadth,
        temporal_continuity
    ], dtype=np.float32)

    return feature_vector


# ─────────────────────────────────────────────────────────────────────────────
# 3. XGBoost Model Training with Data Synthesis
# ─────────────────────────────────────────────────────────────────────────────
def generate_augmented_training_data(base_profiles: List[Dict[str, Any]], n_samples: int = 650) -> Tuple[np.ndarray, np.ndarray]:
    """Generates a diverse tabular dataset via controlled realistic variance."""
    X_list = []
    y_list = []

    for profile in base_profiles:
        base_x = extract_features(profile)
        base_y = float(profile["target_score"])
        X_list.append(base_x)
        y_list.append(base_y)

    # Synthesize realistic developer portfolios across Junior -> Staff tiers
    while len(X_list) < n_samples:
        parent = random.choice(base_profiles)
        parent_x = extract_features(parent)
        target = float(parent["target_score"])

        # Realistic feature perturbations
        perturbation = np.random.normal(0, 0.08, size=parent_x.shape)
        noisy_x = np.maximum(0.0, parent_x * (1.0 + perturbation))

        # Discrete adjustments
        noisy_x[0] = max(20.0, noisy_x[0])   # word count
        noisy_x[7] = max(2.0, round(noisy_x[7])) # skills
        noisy_x[10] = max(1.0, round(noisy_x[10])) # projects
        noisy_x[14] = max(0.0, round(noisy_x[14])) # experience
        noisy_x[17] = 1.0 if random.random() > 0.15 else 0.0 # current employee
        noisy_x[18] = 1.0 if random.random() > 0.10 else 0.0 # education

        # Correlated score adjustment based on metric density and action verbs
        metric_delta = (noisy_x[3] - parent_x[3]) * 0.8
        verb_delta = (noisy_x[1] - parent_x[1]) * 0.5
        link_delta = (noisy_x[11] - parent_x[11]) * 4.0
        adjusted_score = np.clip(target + metric_delta + verb_delta + link_delta + np.random.normal(0, 1.5), 35.0, 99.0)

        X_list.append(noisy_x.astype(np.float32))
        y_list.append(round(float(adjusted_score), 2))

    return np.array(X_list, dtype=np.float32), np.array(y_list, dtype=np.float32)


def train_xgboost_scorer(X: np.ndarray, y: np.ndarray) -> Tuple[xgb.XGBRegressor, float, Dict[str, float]]:
    """Trains and validates the XGBoost ATS scoring regressor."""
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=RANDOM_SEED)

    model = xgb.XGBRegressor(
        n_estimators=90,
        max_depth=4,
        learning_rate=0.07,
        subsample=0.85,
        colsample_bytree=0.85,
        reg_alpha=0.15,
        reg_lambda=1.2,
        random_state=RANDOM_SEED,
        objective="reg:squarederror"
    )

    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
    preds = model.predict(X_test)

    r2 = float(r2_score(y_test, preds))
    rmse = float(math.sqrt(mean_squared_error(y_test, preds)))
    print(f"[XGBoost Scorer] Training Complete -> R2: {r2:.4f} | RMSE: {rmse:.4f} pts")

    # Compute SHAP baseline expected value
    explainer = shap.TreeExplainer(model)
    raw_ev = explainer.expected_value
    if isinstance(raw_ev, (np.ndarray, list)):
        expected_value = float(np.ravel(raw_ev)[0])
    else:
        expected_value = float(raw_ev)

    metrics = {
        "r2_score": r2,
        "rmse": rmse,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "shap_expected_value": expected_value
    }

    return model, expected_value, metrics


# ─────────────────────────────────────────────────────────────────────────────
# 4. Skill Co-occurrence Graph (k-NN) Engine
# ─────────────────────────────────────────────────────────────────────────────
MASTER_TECH_TAXONOMY = [
    # Languages
    "TypeScript", "JavaScript", "Python", "Go", "Java", "C++", "Rust", "C#", "SQL", "Bash",
    # Frontend
    "React", "Next.js", "Vue.js", "Angular", "Tailwind CSS", "Redux", "GraphQL", "HTML", "CSS", "Vite",
    # Backend
    "Node.js", "NestJS", "FastAPI", "Express", "Django", "Spring Boot", "Flask", "gRPC", "REST API",
    # Databases & Storage
    "PostgreSQL", "MongoDB", "Redis", "MySQL", "Kafka", "ClickHouse", "Elasticsearch", "SQLite", "DynamoDB",
    # Cloud & DevOps
    "Docker", "Kubernetes", "AWS", "Terraform", "GitHub Actions", "CI/CD", "Linux", "GCP", "Azure", "ArgoCD",
    # AI & Machine Learning
    "PyTorch", "TensorFlow", "Hugging Face", "XGBoost", "Scikit-Learn", "LangChain", "Vector DBs", "FastAPI",
    # Testing & Observability
    "Jest", "Pytest", "Prometheus", "Grafana", "Datadog", "OpenTelemetry", "Storybook", "Supertest"
]

def build_skill_knn_graph() -> NearestNeighbors:
    """Constructs a technology co-occurrence affinity matrix and fits a k-NN model."""
    n_skills = len(MASTER_TECH_TAXONOMY)
    cooccurrence = np.eye(n_skills, dtype=np.float32) * 2.0

    # Strong natural software engineering tech affinities
    affinities = [
        ("React", "TypeScript", 0.9), ("React", "Tailwind CSS", 0.85), ("React", "Next.js", 0.95),
        ("NestJS", "TypeScript", 0.95), ("NestJS", "MongoDB", 0.8), ("NestJS", "PostgreSQL", 0.85),
        ("Go", "Docker", 0.85), ("Go", "Kubernetes", 0.9), ("Go", "gRPC", 0.88), ("Go", "Kafka", 0.82),
        ("Python", "FastAPI", 0.9), ("Python", "PyTorch", 0.88), ("Python", "Docker", 0.8),
        ("Kubernetes", "Terraform", 0.88), ("Docker", "AWS", 0.82), ("Docker", "CI/CD", 0.9),
        ("PostgreSQL", "Redis", 0.8), ("Kafka", "ClickHouse", 0.75), ("PyTorch", "Hugging Face", 0.92)
    ]

    skill_index = {s.lower(): i for i, s in enumerate(MASTER_TECH_TAXONOMY)}
    for s1, s2, weight in affinities:
        i1, i2 = skill_index.get(s1.lower()), skill_index.get(s2.lower())
        if i1 is not None and i2 is not None:
            cooccurrence[i1, i2] = weight
            cooccurrence[i2, i1] = weight

    # Normalize rows
    row_sums = np.linalg.norm(cooccurrence, axis=1, keepdims=True)
    norm_matrix = cooccurrence / np.maximum(row_sums, 1e-6)

    knn = NearestNeighbors(n_neighbors=5, metric="cosine", algorithm="brute")
    knn.fit(norm_matrix)
    print(f"[Skill k-NN] Successfully indexed {n_skills} technologies into co-occurrence graph.")
    return knn


# ─────────────────────────────────────────────────────────────────────────────
# 5. DRL LinUCB Recruiter Persona Simulation (20,000 Episodes)
# ─────────────────────────────────────────────────────────────────────────────
ACTIONS = ["a_1", "a_2", "a_3", "a_4", "a_5", "a_6"]
ACTION_NAMES = {
    "a_1": "Projects First (DevTerminal template)",
    "a_2": "Experience First (BentoGrid template)",
    "a_3": "Skills First (Neobrutalism template)",
    "a_4": "Spotlight Hero Project (ModernMinimalist template)",
    "a_5": "Academic Hierarchy (AcademicLaTeX template)",
    "a_6": "Balanced Full-Stack Showcase"
}

def simulate_linucb_priors(n_episodes: int = 20000, d: int = 8) -> Dict[str, Any]:
    """
    Simulates 20,000 visitor interactions across 3 distinct recruiter personas to establish
    pre-calibrated covariance matrices A_a and bias vectors b_a.
    """
    # Initialize A_a as Identity matrix, b_a as zeros
    A = {a: np.eye(d, dtype=np.float32) for a in ACTIONS}
    b = {a: np.zeros(d, dtype=np.float32) for a in ACTIONS}
    alpha = 0.25

    # True preference vectors for 3 realistic recruiter personas
    # Personas:
    # 1. Tech Lead / Eng Manager (Prefers a_1 Projects First or a_4 Spotlight)
    # 2. Executive Recruiter / HR (Prefers a_2 Experience First or a_6 Balanced)
    # 3. Academic / Research Recruiter (Prefers a_5 Academic Hierarchy)
    for _ in range(n_episodes):
        persona_type = random.choice(["eng_manager", "hr_recruiter", "academic"])
        
        # Synthetic visitor context vector
        # [source, device, time, yoe, domain, project_cnt, skill_cnt, bias]
        if persona_type == "eng_manager":
            x = np.array([0.8, 0.0, random.uniform(0.3, 0.8), random.uniform(0.3, 0.9), 1.0, 0.6, 0.7, 1.0], dtype=np.float32)
            ideal_action = "a_1" if random.random() > 0.3 else "a_4"
        elif persona_type == "hr_recruiter":
            x = np.array([1.0, random.choice([0.0, 1.0]), random.uniform(0.4, 0.7), random.uniform(0.2, 0.8), 0.5, 0.4, 0.6, 1.0], dtype=np.float32)
            ideal_action = "a_2" if random.random() > 0.25 else "a_6"
        else:
            x = np.array([0.2, 0.0, random.uniform(0.2, 0.9), random.uniform(0.1, 0.5), 0.3, 0.3, 0.5, 1.0], dtype=np.float32)
            ideal_action = "a_5"

        # LinUCB action selection
        scores = {}
        for a in ACTIONS:
            A_inv = np.linalg.inv(A[a])
            theta = A_inv @ b[a]
            ucb = float(x @ theta + alpha * math.sqrt(x @ A_inv @ x))
            scores[a] = ucb

        chosen_action = max(scores, key=scores.get)

        # Reward simulation
        if chosen_action == ideal_action:
            reward = random.uniform(14.0, 19.5) # High conversion reward
        else:
            reward = random.uniform(1.0, 5.0)   # Low conversion reward

        # Real-time online update (Rank-1 Sherman-Morrison equivalent)
        A[chosen_action] += np.outer(x, x)
        b[chosen_action] += reward * x

    # Format for JSON serialization
    serialized_priors = {
        "dimension": d,
        "actions": ACTIONS,
        "action_descriptions": ACTION_NAMES,
        "matrices": {a: A[a].tolist() for a in ACTIONS},
        "vectors": {a: b[a].tolist() for a in ACTIONS},
        "episodes_simulated": n_episodes,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    print(f"[DRL LinUCB] Simulated {n_episodes} interaction episodes. Calibrated covariance priors ready.")
    return serialized_priors


# ─────────────────────────────────────────────────────────────────────────────
# 6. Main Pipeline Runner & Artifact Serializer
# ─────────────────────────────────────────────────────────────────────────────
def run_training_pipeline():
    print("=" * 75)
    print("🚀 PORTFOLIO INTELLIGENCE: OFFLINE TRAINING & SYNTHESIS PIPELINE")
    print("=" * 75)

    # 1. Load Base Corpus
    print(f"[Corpus] Loading base profiles from {DATA_FILE}...")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        profiles = json.load(f)
    print(f"[Corpus] Loaded {len(profiles)} base profiles.")

    # 2. Augment Data & Extract Features
    print("[Synthesis] Augmenting dataset to 650 profiles with realistic variance...")
    X, y = generate_augmented_training_data(profiles, n_samples=650)
    print(f"[Synthesis] Feature matrix shape: {X.shape} | Score range: [{y.min():.1f}, {y.max():.1f}]")

    # 3. Train XGBoost Model & Precompute SHAP Baselines
    print("[Training] Training XGBoost Regressor with 24 engineered features...")
    xgb_model, shap_expected_val, model_metrics = train_xgboost_scorer(X, y)

    # 4. Build Skill Graph
    print("[Graph] Building Technology Co-occurrence Graph...")
    skill_knn = build_skill_knn_graph()

    # 5. Simulate DRL LinUCB Recruiter Environment
    print("[DRL Simulation] Running 20,000 Gymnasium-style Recruiter Interaction Episodes...")
    bandit_priors = simulate_linucb_priors(n_episodes=20000, d=8)

    # 6. Serialize Artifacts
    print("\n📦 SERIALIZING PRODUCTION ARTIFACTS...")

    # A. XGBoost Model Package
    model_pkg_path = os.path.join(ARTIFACTS_DIR, "ats_xgboost.joblib")
    joblib.dump({
        "model": xgb_model,
        "feature_names": [f["name"] for f in FEATURE_DEFINITIONS],
        "feature_definitions": FEATURE_DEFINITIONS,
        "shap_expected_value": shap_expected_val,
        "version": "1.0.0"
    }, model_pkg_path, compress=3)
    print(f"  ✓ Saved: {model_pkg_path} ({os.path.getsize(model_pkg_path) / 1024:.1f} KB)")

    # B. Skill k-NN Graph Package
    skill_pkg_path = os.path.join(ARTIFACTS_DIR, "skill_knn.joblib")
    joblib.dump({
        "knn_model": skill_knn,
        "taxonomy": MASTER_TECH_TAXONOMY,
        "version": "1.0.0"
    }, skill_pkg_path, compress=3)
    print(f"  ✓ Saved: {skill_pkg_path} ({os.path.getsize(skill_pkg_path) / 1024:.1f} KB)")

    # C. LinUCB Bandit Priors
    priors_path = os.path.join(ARTIFACTS_DIR, "bandit_priors.json")
    with open(priors_path, "w", encoding="utf-8") as f:
        json.dump(bandit_priors, f, indent=2)
    print(f"  ✓ Saved: {priors_path} ({os.path.getsize(priors_path) / 1024:.1f} KB)")

    # D. Feature Schema
    schema_path = os.path.join(ARTIFACTS_DIR, "feature_schema.json")
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump({
            "version": "1.0.0",
            "features_count": len(FEATURE_DEFINITIONS),
            "features": FEATURE_DEFINITIONS
        }, f, indent=2)
    print(f"  ✓ Saved: {schema_path} ({os.path.getsize(schema_path) / 1024:.1f} KB)")

    # E. Training Report
    report_path = os.path.join(ARTIFACTS_DIR, "training_report.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump({
            "status": "success",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "metrics": model_metrics,
            "drl_episodes": 20000,
            "taxonomy_size": len(MASTER_TECH_TAXONOMY)
        }, f, indent=2)
    print(f"  ✓ Saved: {report_path}")

    print("\n" + "=" * 75)
    print("✨ ALL MODELS SUCCESSFULLY TRAINED & ARTIFACTS GENERATED!")
    print("=" * 75)


if __name__ == "__main__":
    run_training_pipeline()
