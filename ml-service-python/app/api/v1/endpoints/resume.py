import time
from fastapi import APIRouter, UploadFile, File
from app.core.logging import logger
from app.schemas.resume import ResumeParseResponse
from app.services.resume_service import parse_resume_document

router = APIRouter()

@router.post("/parse-resume", response_model=ResumeParseResponse, tags=["Resume Parser"])
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded resume PDF and parses it
    into a structured portfolio JSON schema.
    """
    t0 = time.time()
    logger.info(f"Received resume upload: '{file.filename}', content_type='{file.content_type}'")

    file_bytes = await file.read()
    result = parse_resume_document(file_bytes)

    total_time = round(time.time() - t0, 2)
    logger.info(f"Completed resume parse for '{file.filename}' in {total_time}s")
    return result
