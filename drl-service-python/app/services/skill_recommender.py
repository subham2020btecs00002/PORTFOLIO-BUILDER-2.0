"""
Skill Gap Recommendation Service.
Traverses the technology co-occurrence graph using k-Nearest Neighbors.
"""

from typing import List, Dict, Any, Set
import numpy as np
from app.core.model_loader import model_registry

# Domain taxonomy lookup
TECH_CATEGORY_LOOKUP = {
    "TypeScript": "Language", "JavaScript": "Language", "Python": "Language", "Go": "Language",
    "Java": "Language", "C++": "Language", "Rust": "Language", "SQL": "Database",
    "React": "Frontend", "Next.js": "Frontend", "Vue.js": "Frontend", "Tailwind CSS": "Frontend",
    "Node.js": "Backend", "NestJS": "Backend", "FastAPI": "Backend", "Express": "Backend",
    "Spring Boot": "Backend", "Django": "Backend", "PostgreSQL": "Database", "MongoDB": "Database",
    "Redis": "Database", "Kafka": "Messaging", "ClickHouse": "Database",
    "Docker": "DevOps", "Kubernetes": "DevOps", "AWS": "Cloud", "Terraform": "DevOps",
    "CI/CD": "DevOps", "PyTorch": "Machine Learning", "Hugging Face": "Machine Learning",
    "Jest": "Testing", "Pytest": "Testing", "ArgoCD": "DevOps"
}


def recommend_skill_gaps(current_skills: List[Dict[str, Any]], top_n: int = 3) -> List[Dict[str, Any]]:
    """
    Given candidate's listed skills, finds highest-affinity complementary technologies
    they are missing based on industry co-occurrence patterns.
    """
    if not model_registry.is_loaded:
        model_registry.load_artifacts()

    taxonomy = model_registry.skill_taxonomy
    if not taxonomy:
        return []

    # Normalize candidate skills
    candidate_skill_names: Set[str] = set()
    for s in current_skills:
        if isinstance(s, dict):
            name = s.get("name", "")
        else:
            name = getattr(s, "name", "")
        if name:
            candidate_skill_names.add(name.strip().lower())

    # Build one-hot/frequency vector on taxonomy
    tax_lower = [t.lower() for t in taxonomy]
    input_vector = np.zeros((1, len(taxonomy)), dtype=np.float32)
    for i, t_name in enumerate(tax_lower):
        if t_name in candidate_skill_names:
            input_vector[0, i] = 1.0

    # If no recognized skills, provide high-value universal defaults
    if np.sum(input_vector) == 0:
        return [
            {"skill": "TypeScript", "relevance_score": 0.95, "category": "Language"},
            {"skill": "Docker", "relevance_score": 0.90, "category": "DevOps"},
            {"skill": "PostgreSQL", "relevance_score": 0.88, "category": "Database"}
        ]

    # Query nearest neighbors in technology space
    try:
        distances, indices = model_registry.skill_knn.kneighbors(input_vector, n_neighbors=min(10, len(taxonomy)))
        recommended: List[Dict[str, Any]] = []

        for idx, dist in zip(indices[0], distances[0]):
            candidate_tech = taxonomy[idx]
            if candidate_tech.lower() not in candidate_skill_names:
                relevance = round(float(np.clip(1.0 - dist, 0.5, 0.98)), 2)
                cat = TECH_CATEGORY_LOOKUP.get(candidate_tech, "General")
                recommended.append({
                    "skill": candidate_tech,
                    "relevance_score": relevance,
                    "category": cat
                })
                if len(recommended) >= top_n:
                    break

        return recommended
    except Exception:
        # Fallback recommendations if graph traversal fails
        return [
            {"skill": "Docker", "relevance_score": 0.91, "category": "DevOps"},
            {"skill": "Redis", "relevance_score": 0.85, "category": "Database"},
            {"skill": "TypeScript", "relevance_score": 0.89, "category": "Language"}
        ]
