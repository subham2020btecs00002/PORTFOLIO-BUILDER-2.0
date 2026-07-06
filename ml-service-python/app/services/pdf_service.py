from pypdf import PdfReader
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Parses a PDF file from a bytes buffer and extracts all readable text,
    including underlying hyperlink annotations.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        links = []
        
        for i, page in enumerate(reader.pages):
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
                                # Clean potential byte wrapper or spaces
                                uri_str = str(uri).strip()
                                if uri_str not in links:
                                    links.append(uri_str)
                                    
        # Append found links at the end so the LLM knows their existence and can map them
        if links:
            text += "\n\nExtracted Hyperlinks / URLs from Document:\n"
            for link in links:
                text += f"- {link}\n"
                
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""
