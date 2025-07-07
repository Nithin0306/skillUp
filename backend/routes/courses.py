from fastapi import APIRouter, HTTPException

router = APIRouter()

@router.get("/fetch_courses/{job_title}")
def fetch_courses(job_title: str):
    try:
        # Placeholder: Replace with service logic to fetch courses
        return {"courses": [], "job_title": job_title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 