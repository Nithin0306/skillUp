from fastapi import APIRouter
from datetime import datetime
import requests
import logging
from backend.config.settings import settings
from backend.utils.helpers import clean_gemini_response
from backend.models.schemas import SkillsRequest
from backend.prompts.prompts import get_project_ideas_prompt

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/project_generator/")
async def project_generator(request: SkillsRequest):
    try:
        skills = request.skills
        
        prompt = get_project_ideas_prompt(skills)

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=prompt, timeout=30)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json and response_json["candidates"]:
                project_ideas = response_json["candidates"][0]["content"]["parts"][0]["text"]
                project_ideas = clean_gemini_response(project_ideas)
            else:
                # Only use fallback if API response is empty
                project_ideas = "Unable to generate project ideas at this time. Please try again."

        else:
            logger.error(f"Gemini API error: {response.text}")
            project_ideas = "Unable to generate project ideas due to API error. Please try again."

        return {
            "project_ideas": project_ideas,
            "skills_analyzed": skills,
            "analysis_timestamp": datetime.now().isoformat(),
            "total_skills": len(skills)
        }

    except Exception as e:
        logger.error(f"Project generation error: {str(e)}")
        return {
            "project_ideas": "Unable to generate project ideas due to system error. Please try again.",
            "error": str(e)
        }
