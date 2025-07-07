from fastapi import APIRouter, HTTPException, Body
from ..models.request_models import SkillsRequest

router = APIRouter()

@router.post("/project_generator/")
async def project_generator(request: SkillsRequest = Body(...)):
    try:
        # Placeholder: Replace with service logic for project generation
        return {"project": "Sample project", "skills": request.skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 