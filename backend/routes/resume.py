from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..services.pdf_utils import extract_text_from_pdf, clean_gemini_response
from ..models.request_models import JobTitleRequest

router = APIRouter()

@router.post("/analyze_resume/")
async def analyze_resume(file: UploadFile = File(...), job_title: str = Form(...)):
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
        if not job_title or len(job_title.strip()) < 2:
            raise HTTPException(status_code=400, detail="Valid job title is required")
        extracted_text = extract_text_from_pdf(file_content)
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        # Placeholder for further analysis logic
        return {"extracted_text": extracted_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 