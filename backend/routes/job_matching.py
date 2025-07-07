from fastapi import APIRouter, HTTPException, Body
from ..models.request_models import JobMatchingRequest

router = APIRouter()

@router.post("/job_matching/")
async def job_matching(request: JobMatchingRequest = Body(...)):
    try:
        # Placeholder: Replace with service logic for job matching
        return {"match": True, "request": request.dict()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 