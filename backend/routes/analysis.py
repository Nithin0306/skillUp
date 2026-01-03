from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from datetime import datetime
import requests
import logging
from backend.config.settings import settings
from backend.utils.helpers import extract_text_from_pdf, clean_gemini_response
from backend.prompts.prompts import get_analysis_prompt

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze_resume/")
async def analyze_resume(file: UploadFile = File(...), job_title: str = Form(...)):
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Validate file size (10MB limit)
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
        
        # Validate job title
        if not job_title or len(job_title.strip()) < 2:
            raise HTTPException(status_code=400, detail="Valid job title is required")
        
        extracted_text = extract_text_from_pdf(file_content)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        prompt = get_analysis_prompt(job_title, extracted_text)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=prompt, timeout=30)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json and response_json["candidates"]:
                skill_gap = response_json["candidates"][0]["content"]["parts"][0]["text"]
                skill_gap = clean_gemini_response(skill_gap)
            else:
                skill_gap = "- No specific missing skills identified\n- Consider reviewing job requirements for additional skills"

        else:
            logger.error(f"Gemini API error: {response.text}")
            skill_gap = "- Unable to analyze resume at this time\n- Please try again later"

        # IMPORTANT: Return both missing skills AND extracted text
        return {
            "missing_skills": skill_gap,
            "extracted_text": extracted_text,  # This is crucial for job matching
            "job_title": job_title,
            "analysis_timestamp": datetime.now().isoformat(),
            "resume_length": len(extracted_text)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze resume")
