from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import uvicorn

from backend.config.settings import settings
from backend.exceptions.handlers import http_exception_handler, general_exception_handler
from backend.routes import core, analysis, courses, jobs, projects
from fastapi import HTTPException

# Configure logging
logging.basicConfig(level=settings.LOG_LEVEL.upper())
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION
)

# Enhanced CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Rate limiting middleware (basic implementation)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Basic rate limiting - in production, use Redis or similar
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = "100"
    response.headers["X-RateLimit-Remaining"] = "99"
    return response

# Include Routers
app.include_router(core.router)
app.include_router(analysis.router)
app.include_router(courses.router)
app.include_router(jobs.router)
app.include_router(projects.router)

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app", 
        host="0.0.0.0", 
        port=settings.PORT,
        log_level=settings.LOG_LEVEL,
        reload=True
    )