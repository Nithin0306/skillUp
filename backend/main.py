from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import os

from .routes.health import router as health_router
from .routes.resume import router as resume_router
from .routes.courses import router as courses_router
from .routes.youtube import router as youtube_router
from .routes.job_matching import router as job_matching_router
from .routes.project_generator import router as project_generator_router
from .utils.error_handlers import http_exception_handler, general_exception_handler

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Skill Gap Analyzer API",
    description="AI-powered resume analysis and career guidance platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://skill-up-topaz.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, general_exception_handler)
app.add_exception_handler(Exception, http_exception_handler)

app.include_router(health_router)
app.include_router(resume_router)
app.include_router(courses_router)
app.include_router(youtube_router)
app.include_router(job_matching_router)
app.include_router(project_generator_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=int(os.getenv("PORT", 8000)),
        log_level="info"
    )