from typing import Dict, Any
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import PDFProcessingError
from app.prompts.resume_prompts import RESUME_PARSE_PROMPT
from app.schemas.resume import ResumeParseResponse
from app.services.llm_client import llm_client
from app.services.pdf_service import extract_text_from_pdf
from app.utils.normalizers import clean_cgpa_or_percentage, normalize_degree, normalize_date
from app.utils.url_cleaner import clean_link

def post_process_resume_dict(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Applies strict normalization to degree formats, dates, GPA, and social URLs.
    """
    if not isinstance(data, dict):
        return {}

    # 0. Clean candidate full name
    if "fullName" in data and isinstance(data["fullName"], str):
        data["fullName"] = " ".join(data["fullName"].strip().split())

    # 1. Clean portfolio links
    links = data.get("portfolioLinks", {})
    if isinstance(links, dict):
        for platform in ["github", "leetcode", "gfg", "linkedin"]:
            if platform in links:
                links[platform] = clean_link(links[platform], platform)
        data["portfolioLinks"] = links

    # 2. Clean project links
    projects = data.get("projects", [])
    if isinstance(projects, list):
        for proj in projects:
            if isinstance(proj, dict) and "link" in proj:
                proj["link"] = clean_link(proj["link"])
        data["projects"] = projects

    # 3. Clean education records
    education = data.get("education", [])
    if isinstance(education, list):
        now_year = datetime.now().year
        for edu in education:
            if isinstance(edu, dict):
                if "cgpaOrPercentage" in edu:
                    edu["cgpaOrPercentage"] = clean_cgpa_or_percentage(edu["cgpaOrPercentage"])
                if "degree" in edu:
                    edu["degree"] = normalize_degree(edu["degree"])
                if "yearOfJoining" in edu:
                    edu["yearOfJoining"] = normalize_date(edu["yearOfJoining"], 2019)

                y_pass_raw = str(edu.get("yearOfPassing", ""))
                has_present_kw = (
                    "present" in y_pass_raw.lower()
                    or "current" in y_pass_raw.lower()
                    or "ongoing" in y_pass_raw.lower()
                    or "pursuing" in y_pass_raw.lower()
                )

                # Normalize yearOfPassing if valid date string
                norm_pass = ""
                if not has_present_kw and y_pass_raw and y_pass_raw.lower() != "none":
                    norm_pass = normalize_date(y_pass_raw, 2023)

                pass_year = None
                if norm_pass:
                    try:
                        pass_year = int(norm_pass.split("-")[0])
                    except Exception:
                        pass

                # If pass_year is in the past (<= now_year), they graduated! NOT current student
                if pass_year and pass_year <= now_year:
                    edu["isCurrentStudent"] = False
                    edu["yearOfPassing"] = norm_pass
                elif has_present_kw or edu.get("isCurrentStudent") is True:
                    edu["isCurrentStudent"] = True
                    edu["yearOfPassing"] = norm_pass  # Keep expected graduation date if available
                else:
                    edu["isCurrentStudent"] = False
                    edu["yearOfPassing"] = norm_pass

                y_join = edu.get("yearOfJoining")
                y_pass = edu.get("yearOfPassing")
                if y_join and y_pass and y_join >= y_pass and not edu.get("isCurrentStudent"):
                    try:
                        join_year = int(y_join.split("-")[0])
                        edu["yearOfPassing"] = f"{join_year + 4}-05-30"
                    except Exception:
                        pass
        data["education"] = education

    # 4. Clean professional history
    history = data.get("professionalHistory", [])
    if isinstance(history, list):
        for hist in history:
            if isinstance(hist, dict):
                y_leaving = hist.get("yearOfLeaving", "")
                if y_leaving and (
                    "present" in str(y_leaving).lower()
                    or "current" in str(y_leaving).lower()
                    or hist.get("isCurrentEmployee") is True
                ):
                    hist["isCurrentEmployee"] = True
                    hist["yearOfLeaving"] = ""
                else:
                    if "yearOfLeaving" in hist:
                        hist["yearOfLeaving"] = normalize_date(hist["yearOfLeaving"], 2026)

                if "yearOfJoining" in hist:
                    hist["yearOfJoining"] = normalize_date(hist["yearOfJoining"], 2023)

                y_join = hist.get("yearOfJoining")
                y_leave = hist.get("yearOfLeaving")
                if y_join and y_leave and not hist.get("isCurrentEmployee") and y_join >= y_leave:
                    try:
                        join_year = int(y_join.split("-")[0])
                        hist["yearOfLeaving"] = f"{join_year + 2}-12-31"
                    except Exception:
                        pass
        data["professionalHistory"] = history

    return data

def parse_resume_document(file_bytes: bytes) -> ResumeParseResponse:
    """
    End-to-end orchestration:
    1. Extracts PDF text and annotations
    2. Enforces prompt bounds
    3. Queries Gemini with JSON schema constraints
    4. Normalizes output fields
    5. Validates and returns strongly typed ResumeParseResponse
    """
    raw_text = extract_text_from_pdf(file_bytes)
    if not raw_text or len(raw_text.strip()) < 10:
        raise PDFProcessingError("No readable text found in PDF. Scanned images or password-protected files are not supported.")

    # Guard against prompt explosion
    trimmed_text = raw_text[: settings.MAX_PROMPT_CHARS].strip()
    current_year = datetime.now().year
    prompt = RESUME_PARSE_PROMPT.format(resume_text=trimmed_text, current_year=current_year)

    logger.info(f"Parsing resume text with LLM ({len(trimmed_text)} chars)...")
    raw_json = llm_client.generate_json(prompt, temperature=0.1)

    normalized_data = post_process_resume_dict(raw_json)
    validated_response = ResumeParseResponse(**normalized_data)
    logger.info(f"Successfully parsed resume: '{validated_response.title}' with {len(validated_response.skills)} skills.")
    return validated_response
