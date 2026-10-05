import io
from pypdf import PdfReader
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import PDFProcessingError

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Parses a PDF file buffer and extracts all readable text and embedded hyperlink annotations.
    Limits scanning to MAX_PDF_PAGES to prevent server denial-of-service on massive documents.
    """
    if not file_bytes:
        raise PDFProcessingError("Empty file buffer provided.")

    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        total_pages = len(reader.pages)
        pages_to_read = min(total_pages, settings.MAX_PDF_PAGES)
        logger.info(f"Extracting text from PDF ({pages_to_read}/{total_pages} pages)...")

        text = ""
        links = []

        for i in range(pages_to_read):
            page = reader.pages[i]
            # 1. Extract regular visible text
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

            # 2. Extract underlying hyperlinks from annotations
            if "/Annots" in page:
                for annot in page["/Annots"]:
                    obj = annot.get_object()
                    if obj and obj.get("/Subtype") == "/Link":
                        action = obj.get("/A")
                        if action:
                            uri = action.get("/URI")
                            if uri:
                                uri_str = str(uri).strip()
                                if uri_str not in links:
                                    links.append(uri_str)

        # Append hyperlinks at end for LLM context
        if links:
            text += "\n\nExtracted Hyperlinks / URLs from Document:\n"
            for link in links:
                text += f"- {link}\n"

        extracted_text = text.strip()
        logger.info(f"Successfully extracted {len(extracted_text)} characters from PDF.")
        return extracted_text

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise PDFProcessingError(f"Failed to extract readable text from PDF: {str(e)}")
