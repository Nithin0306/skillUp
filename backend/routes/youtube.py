from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/youtube-courses/{job_title}")
def get_youtube_courses(job_title: str):
    try:
        # Placeholder: Replace with service logic to fetch YouTube courses
        return {"youtube_courses": [], "job_title": job_title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 