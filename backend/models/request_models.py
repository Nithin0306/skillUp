from pydantic import BaseModel, validator
from typing import List

class SkillsRequest(BaseModel):
    skills: List[str]
    @validator('skills')
    def validate_skills(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Skills list cannot be empty')
        if len(v) > 20:
            raise ValueError('Too many skills provided (max 20)')
        return [skill.strip() for skill in v if skill.strip()]

class JobTitleRequest(BaseModel):
    job_title: str
    @validator('job_title')
    def validate_job_title(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Job title must be at least 2 characters')
        if len(v.strip()) > 100:
            raise ValueError('Job title too long (max 100 characters)')
        return v.strip()

class JobMatchingRequest(BaseModel):
    skills: List[str]
    job_title: str
    extracted_text: str
    @validator('skills')
    def validate_skills(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Skills list cannot be empty')
        return [skill.strip() for skill in v if skill.strip()]
    @validator('job_title')
    def validate_job_title(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError('Job title must be at least 2 characters')
        return v.strip()
    @validator('extracted_text')
    def validate_extracted_text(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Extracted text must be provided')
        return v.strip() 