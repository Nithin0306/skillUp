from fastapi import APIRouter, HTTPException
from datetime import datetime
import requests
import logging
from backend.config.settings import settings
from backend.utils.helpers import clean_gemini_response
from backend.models.schemas import JobMatchingRequest
from backend.prompts.prompts import get_job_matching_prompt

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/job_matching/")
async def job_matching(request: dict):
    # Note: Using dict instead of Pydantic model here to match original implementation signature slightly,
    # but let's encourage using the model internally or validation.
    # The original implementation used request: dict.
    # Let's check if we can switch to the Pydantic model directly without breaking frontend calls effectively.
    # Frontend likely sends JSON body.
    
    try:
        skills = request.get("skills", [])
        job_title = request.get("job_title", "")
        extracted_text = request.get("extracted_text", "")
        
        # Manual validation to match original logic (or we could use Pydantic if we change signature)
        if not skills or len(skills) == 0:
            raise HTTPException(status_code=400, detail="Skills list cannot be empty")
        if not job_title or len(job_title.strip()) < 2:
            raise HTTPException(status_code=400, detail="Valid job title is required")
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Extracted text is required")
        
        prompt = get_job_matching_prompt(extracted_text, skills, job_title)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}

        # Log the request for debugging
        logger.info(f"Sending job matching request for job title: {job_title}")
        logger.info(f"Skills count: {len(skills)}")
        logger.info(f"Resume text length: {len(extracted_text)}")

        response = requests.post(url, headers=headers, json=prompt, timeout=30)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json and response_json["candidates"]:
                job_recommendations = response_json["candidates"][0]["content"]["parts"][0]["text"]
                job_recommendations = clean_gemini_response(job_recommendations)
                
                # Log the response for debugging
                logger.info(f"Job recommendations generated successfully. Length: {len(job_recommendations)}")
                logger.info(f"First 200 chars: {job_recommendations[:200]}...")
                
            else:
                logger.warning("No candidates in Gemini response")
                job_recommendations = "Unable to generate job recommendations at this time. Please try again."

        else:
            logger.error(f"Gemini API error: Status {response.status_code}, Response: {response.text}")
            job_recommendations = "Unable to generate job recommendations due to API error. Please try again."

        return {
            "job_recommendations": job_recommendations,
            "skills_analyzed": skills,
            "job_title": job_title,
            "analysis_timestamp": datetime.now().isoformat(),
            "total_skills": len(skills)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job matching error: {str(e)}")
        return {
            "job_recommendations": "Unable to generate job recommendations due to system error. Please try again.",
            "error": str(e)
        }
