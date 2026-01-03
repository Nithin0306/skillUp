from fastapi import APIRouter
from datetime import datetime
from backend.config.settings import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": settings.PROJECT_VERSION,
        "services": {
            "gemini_api": "configured" if settings.GEMINI_API_KEY else "not_configured",
            "google_api": "configured" if settings.GOOGLE_API_KEY else "not_configured",
            "youtube_api": "configured" if settings.YOUTUBE_API_KEY else "not_configured"
        }
    }

@router.get("/")
def home():
    return {
        "message": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
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
