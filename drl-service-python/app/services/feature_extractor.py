"""
Real-Time 24-Dimensional Feature Extractor Service.
Transforms incoming developer portfolio JSON into numeric vectors for XGBoost inference.
"""

import re
from datetime import datetime
from typing import Tuple, Dict, Any, List
import numpy as np

STRONG_ACTION_VERBS = {
    "architected", "spearheaded", "engineered", "orchestrated", "developed",
    "designed", "implemented", "optimized", "refactored", "accelerated",
    "scaled", "constructed", "deployed", "automated", "streamlined",
    "reduced", "increased", "boosted", "migrated", "championed",
    "integrated", "authored", "mentored", "supervised", "formulated",
    "analyzed", "managed", "delivered", "built", "configured"
}

METRIC_PATTERNS = [
    re.compile(r"\b\d+[\.,]?\d*%\b"),                      # e.g., 45%, 3.8%
    re.compile(r"\$\d+[\.,]?\d*[kKmMbB]?\b"),              # e.g., $50k, $18M
    re.compile(r"\b\d+[\.,]?\d*\s*(ms|s|sec|seconds)\b"),  # e.g., 5ms, 90 seconds
    re.compile(r"\b\d+[\.,]?\d*[kKmMbB]?\s*(req|requests|events|users|skus|nodes)\b", re.I),
    re.compile(r"\b\d+x\b", re.I),                         # e.g., 4x
    re.compile(r"\b\d{2,}\b")                              # general multi-digit impact numbers
]

DEGREE_LEVELS = {
    "phd": 4.0, "doctorate": 4.0,
    "ms": 3.0, "m.s.": 3.0, "m.tech": 3.0, "master": 3.0, "mba": 3.0,
    "bs": 2.0, "b.s.": 2.0, "b.tech": 2.0, "b.e.": 2.0, "bachelor": 2.0,
    "diploma": 1.0, "associate": 1.0
}


def compute_flesch_scores(text: str) -> Tuple[float, float]:
    """Computes standard Flesch Reading Ease and Flesch-Kincaid Grade Level."""
    words = re.findall(r"\b[A-Za-z]+\b", text)
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 0]

    num_words = max(len(words), 1)
    num_sentences = max(len(sentences), 1)

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


def extract_portfolio_features(portfolio_dict: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    Extracts the 24-dimensional feature vector and key textual metrics from portfolio dictionary.
    """
    bio = portfolio_dict.get("description", "") or ""
    skills = portfolio_dict.get("skills", []) or []
    projects = portfolio_dict.get("projects", []) or []
    history = portfolio_dict.get("professionalHistory", []) or []
    education = portfolio_dict.get("education", []) or []

    # Handle both Pydantic models and dictionaries
    def get_val(obj, key, default=""):
        if hasattr(obj, key):
            return getattr(obj, key) or default
        elif isinstance(obj, dict):
            return obj.get(key, default) or default
        return default

    # Aggregate text bodies
    all_text_chunks = [bio]
    for p in projects:
        t = get_val(p, "title")
        d = get_val(p, "description")
        all_text_chunks.append(f"{t} {d}")
    for h in history:
        pos = get_val(h, "position")
        resp = get_val(h, "responsibility")
        all_text_chunks.append(f"{pos} {resp}")
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
    expert_skills = sum(1 for s in skills if str(get_val(s, "level", "")).lower() == "expert")
    expert_skill_ratio = expert_skills / max(skill_count, 1)
    unique_categories = len(set(get_val(s, "category", "General") for s in skills if get_val(s, "category")))

    # 11-14. Projects
    project_count = len(projects)
    links_count = sum(1 for p in projects if get_val(p, "link") and len(str(get_val(p, "link")).strip()) > 5)
    project_link_ratio = links_count / max(project_count, 1)
    repo_count = sum(1 for p in projects if "github.com" in str(get_val(p, "link")).lower())
    project_repo_ratio = repo_count / max(project_count, 1)

    skill_names = [str(get_val(s, "name")).lower() for s in skills if get_val(s, "name")]
    used_skills = 0
    proj_text_lower = " ".join([
        str(get_val(p, "description")).lower() + " " + " ".join([str(t) for t in get_val(p, "technologies", [])])
        for p in projects
    ])
    for s_name in skill_names:
        if s_name and s_name in proj_text_lower:
            used_skills += 1
    project_skill_cohesion = used_skills / max(len(skill_names), 1)

    # 15-18. Professional History
    experience_count = len(history)
    total_months = 0.0
    current_employee = 0.0
    for h in history:
        if get_val(h, "isCurrentEmployee"):
            current_employee = 1.0
        try:
            start_str = str(get_val(h, "yearOfJoining", ""))
            end_str = str(get_val(h, "yearOfLeaving", ""))
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
        deg = (str(get_val(e, "degree")) + " " + str(get_val(e, "collegeName"))).lower()
        for k, val in DEGREE_LEVELS.items():
            if k in deg:
                highest_degree_score = max(highest_degree_score, val)

    # 21-22. Bio
    bio_length = len(bio.strip())
    bio_specialization = 1.0 if any(
        k in bio.lower() for k in ["engineer", "developer", "architect", "specializ", "passionate", "distributed", "frontend", "backend", "fullstack", "devops", "cloud"]
    ) else 0.0

    # 23. Tech Breadth
    cats = {str(get_val(s, "category")).lower() for s in skills}
    names = {str(get_val(s, "name")).lower() for s in skills}
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

    metadata = {
        "readability_index": round(reading_ease, 1),
        "metric_density": round(metric_density, 3),
        "action_verb_ratio": round(action_verb_ratio, 3),
        "total_words": total_words,
        "metric_count": metric_count,
        "action_verb_count": action_verb_count
    }

    return feature_vector, metadata
