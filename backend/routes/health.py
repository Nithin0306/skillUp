from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()

gemini_key = os.getenv("GEMINI_API_KEY")
google_key = os.getenv("GOOGLE_API_KEY")
youtube_key = os.getenv("YOUTUBE_API_KEY")

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0",
        "services": {
            "gemini_api": "configured" if gemini_key else "not_configured",
            "google_api": "configured" if google_key else "not_configured",
            "youtube_api": "configured" if youtube_key else "not_configured"
        }
    }

@router.get("/")
def home():
    return {
        "message": "Skill Gap Analyzer API",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "analyze_resume": "/analyze_resume/",
            "fetch_courses": "/fetch_courses/{job_title}",
            "youtube_courses": "/youtube-courses/{job_title}",
            "job_matching": "/job_matching/",
            "project_generator": "/project_generator/"
        }
    } 