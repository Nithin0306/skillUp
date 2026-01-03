import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    PROJECT_NAME = "Skill Gap Analyzer API"
    PROJECT_DESCRIPTION = "AI-powered resume analysis and career guidance platform"
    PROJECT_VERSION = "2.0.0"
    
    # API Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
    SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")
    
    # Server Config
    PORT = int(os.getenv("PORT", 8000))
    LOG_LEVEL = "info"
    
    # CORS
    CORS_ORIGINS = [
        "https://skill-up-topaz.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "https://localhost:3000"
    ]

settings = Settings()
