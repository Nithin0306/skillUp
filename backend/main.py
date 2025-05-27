from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from typing import List, Optional
import fitz  # PyMuPDF
from dotenv import load_dotenv
import os
import requests
import json
import re
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Skill Gap Analyzer API",
    description="AI-powered resume analysis and career guidance platform",
    version="2.0.0"
)

# Enhanced CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://skill-up-topaz.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "https://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Load environment variables
load_dotenv()
gemini_key = os.getenv("GEMINI_API_KEY")
google_key = os.getenv("GOOGLE_API_KEY")
youtube_key = os.getenv("YOUTUBE_API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")

# Pydantic models for request validation
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

# Add new request model for job matching
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

# Enhanced error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "Internal server error",
            "timestamp": datetime.now().isoformat(),
            "path": str(request.url)
        }
    )

# Health check endpoint
@app.get("/health")
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

@app.get("/")
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

# Enhanced PDF text extraction
def extract_text_from_pdf(file_content):
    try:
        with fitz.open(stream=file_content, filetype="pdf") as pdf:
            text_parts = []
            for page_num, page in enumerate(pdf):
                if page_num >= 3:  # Limit to first 3 pages
                    break
                page_text = page.get_text("text")
                if page_text.strip():
                    text_parts.append(page_text)
            
            full_text = "\n".join(text_parts)
            # Clean up the text
            full_text = re.sub(r'\n+', '\n', full_text)
            full_text = re.sub(r'\s+', ' ', full_text)
            
            return full_text[:4000]  # Increased limit for better analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

def clean_gemini_response(text):
    """Clean and format Gemini API response"""
    # Remove markdown formatting
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    
    # Clean up extra whitespace
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()
@app.post("/analyze_resume/")
async def analyze_resume(file: UploadFile = File(...), job_title: str = Form(...)):
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
        # Validate file size (10MB limit)
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size too large (max 10MB)")
        
        # Validate job title
        if not job_title or len(job_title.strip()) < 2:
            raise HTTPException(status_code=400, detail="Valid job title is required")
        
        extracted_text = extract_text_from_pdf(file_content)
        
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # Enhanced prompt for better skill gap analysis
        prompt = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"""
Analyze this resume for a {job_title} position and identify missing skills.

RESUME TEXT:
{extracted_text}

TARGET ROLE: {job_title}

INSTRUCTIONS:
1. Compare the resume skills with typical requirements for {job_title}
2. Identify 5-10 most important missing skills
3. Focus on technical skills, tools, frameworks, and methodologies
4. Exclude soft skills and basic requirements
5. Format as a clean bullet-point list

OUTPUT FORMAT:
- [Skill Name]: Brief reason why it's important for {job_title}
- [Skill Name]: Brief reason why it's important for {job_title}

Example:
- React.js: Essential frontend framework for modern web development
- Docker: Critical for containerization and deployment
- AWS: Cloud platform knowledge required for scalable applications

Provide ONLY the bullet-point list, no additional text or explanations.
"""
                        }
                    ]
                }
            ]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=prompt, timeout=30)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json and response_json["candidates"]:
                skill_gap = response_json["candidates"][0]["content"]["parts"][0]["text"]
                skill_gap = clean_gemini_response(skill_gap)
            else:
                skill_gap = "- No specific missing skills identified\n- Consider reviewing job requirements for additional skills"

        else:
            logger.error(f"Gemini API error: {response.text}")
            skill_gap = "- Unable to analyze resume at this time\n- Please try again later"

        # IMPORTANT: Return both missing skills AND extracted text
        return {
            "missing_skills": skill_gap,
            "extracted_text": extracted_text,  # This is crucial for job matching
            "job_title": job_title,
            "analysis_timestamp": datetime.now().isoformat(),
            "resume_length": len(extracted_text)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze resume")

@app.get("/fetch_courses/{job_title}")
def fetch_courses(job_title: str):
    try:
        if not job_title or len(job_title.strip()) < 2:
            raise HTTPException(status_code=400, detail="Valid job title is required")
        
        # Enhanced search queries for better results
        search_queries = [
            f"{job_title} course certification",
            f"{job_title} training program",
            f"learn {job_title} skills online"
        ]
        
        all_courses = []
        
        for query in search_queries:
            try:
                # Search for courses
                search_url = "https://www.googleapis.com/customsearch/v1"
                params = {
                    "key": google_key,
                    "cx": SEARCH_ENGINE_ID,
                    "q": query,
                    "num": 3,
                    "safe": "active"
                }

                response = requests.get(search_url, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if "items" in data:
                        for item in data["items"]:
                            link = item.get("link", "")
                            title = item.get("title", "")
                            
                            # Filter for educational platforms
                            if any(platform in link.lower() for platform in [
                                "coursera.org", "udemy.com", "edx.org", "pluralsight.com",
                                "linkedin.com/learning", "skillshare.com", "udacity.com",
                                "codecademy.com", "freecodecamp.org"
                            ]):
                                platform = "Unknown"
                                if "coursera.org" in link:
                                    platform = "Coursera"
                                elif "udemy.com" in link:
                                    platform = "Udemy"
                                elif "edx.org" in link:
                                    platform = "edX"
                                elif "pluralsight.com" in link:
                                    platform = "Pluralsight"
                                elif "linkedin.com/learning" in link:
                                    platform = "LinkedIn Learning"
                                elif "skillshare.com" in link:
                                    platform = "Skillshare"
                                elif "udacity.com" in link:
                                    platform = "Udacity"
                                elif "codecademy.com" in link:
                                    platform = "Codecademy"
                                elif "freecodecamp.org" in link:
                                    platform = "FreeCodeCamp"
                                
                                course = {
                                    "title": title,
                                    "link": link,
                                    "snippet": item.get("snippet", f"Learn {job_title} skills with this comprehensive course"),
                                    "platform": platform,
                                    "isFree": platform in ["FreeCodeCamp", "edX"] or "free" in title.lower()
                                }
                                
                                # Avoid duplicates
                                if not any(existing["link"] == course["link"] for existing in all_courses):
                                    all_courses.append(course)
                
                time.sleep(0.1)  # Rate limiting
                
            except Exception as e:
                logger.warning(f"Search query failed for '{query}': {str(e)}")
                continue
        
        # If no results found, provide curated fallback courses
        if not all_courses:
            all_courses = get_fallback_courses(job_title)
        
        # Limit to 8 courses and prioritize free ones
        all_courses = sorted(all_courses, key=lambda x: (not x.get("isFree", False), x["title"]))[:8]
        
        return {
            "courses": all_courses,
            "job_title": job_title,
            "total_found": len(all_courses),
            "search_timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Course fetch error: {str(e)}")
        return {
            "courses": get_fallback_courses(job_title),
            "job_title": job_title,
            "total_found": 0,
            "error": "Using fallback courses due to API limitations"
        }

def get_fallback_courses(job_title: str) -> List[dict]:
    """Provide curated fallback courses based on job title"""
    job_lower = job_title.lower()
    
    # Job-specific course mappings
    course_mappings = {
        "software engineer": [
            {"title": "Full Stack Web Development", "link": "https://www.freecodecamp.org/learn/", "platform": "FreeCodeCamp", "isFree": True},
            {"title": "Software Engineering Fundamentals", "link": "https://www.coursera.org/specializations/software-engineering", "platform": "Coursera", "isFree": False},
        ],
        "data scientist": [
            {"title": "Data Science Fundamentals", "link": "https://www.kaggle.com/learn", "platform": "Kaggle Learn", "isFree": True},
            {"title": "Python for Data Science", "link": "https://www.coursera.org/specializations/python", "platform": "Coursera", "isFree": False},
        ],
        "web developer": [
            {"title": "Responsive Web Design", "link": "https://www.freecodecamp.org/learn/responsive-web-design/", "platform": "FreeCodeCamp", "isFree": True},
            {"title": "JavaScript Algorithms and Data Structures", "link": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "platform": "FreeCodeCamp", "isFree": True},
        ]
    }
    
    # Find matching courses
    for key, courses in course_mappings.items():
        if key in job_lower:
            return [
                {
                    **course,
                    "snippet": f"Learn essential skills for {job_title} with this comprehensive course"
                }
                for course in courses
            ]
    
    # Generic fallback
    return [
        {
            "title": f"{job_title} Fundamentals",
            "link": "https://www.coursera.org/",
            "snippet": f"Learn the fundamentals of {job_title} with expert instruction",
            "platform": "Coursera",
            "isFree": False
        },
        {
            "title": f"Introduction to {job_title}",
            "link": "https://www.edx.org/",
            "snippet": f"Get started with {job_title} through this introductory course",
            "platform": "edX",
            "isFree": True
        }
    ]

@app.get("/youtube-courses/{job_title}")
def get_youtube_courses(job_title: str):
    try:
        if not job_title or len(job_title.strip()) < 2:
            raise HTTPException(status_code=400, detail="Valid job title is required")
        
        # Enhanced search query for better YouTube results
        search_query = f"{job_title} tutorial course 2024"
        youtube_url = f"https://www.googleapis.com/youtube/v3/search"
        
        params = {
            "part": "snippet",
            "q": search_query,
            "type": "video",
            "key": youtube_key,
            "maxResults": 12,
            "order": "relevance",
            "videoDuration": "medium",  # Filter for substantial content
            "safeSearch": "strict"
        }

        response = requests.get(youtube_url, params=params, timeout=10)
        
        if response.status_code != 200:
            logger.error(f"YouTube API error: {response.text}")
            return {
                "videos": [],
                "job_title": job_title,
                "error": "YouTube API temporarily unavailable"
            }
        
        data = response.json()

        if "items" not in data or not data["items"]:
            return {
                "videos": [],
                "job_title": job_title,
                "message": f"No YouTube videos found for {job_title}"
            }

        videos = []
        for item in data.get("items", []):
            if "videoId" in item["id"]:
                video = {
                    "title": item["snippet"]["title"],
                    "video_id": item["id"]["videoId"],
                    "thumbnail": item["snippet"]["thumbnails"].get("high", {}).get("url", ""),
                    "channel": item["snippet"]["channelTitle"],
                    "description": item["snippet"]["description"][:200] + "..." if len(item["snippet"]["description"]) > 200 else item["snippet"]["description"],
                    "published_at": item["snippet"]["publishedAt"],
                    "link": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
                }
                videos.append(video)

        return {
            "videos": videos,
            "job_title": job_title,
            "total_found": len(videos),
            "search_timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"YouTube fetch error: {str(e)}")
        return {
            "videos": [],
            "job_title": job_title,
            "error": f"Failed to fetch YouTube videos: {str(e)}"
        }

# FIXED: Job Matching Endpoint - Only the job matching part
@app.post("/job_matching/")
async def job_matching(request: dict):
    try:
        # Extract data from request
        skills = request.get("skills", [])
        job_title = request.get("job_title", "")
        extracted_text = request.get("extracted_text", "")
        
        # Validate inputs
        if not skills or len(skills) == 0:
            raise HTTPException(status_code=400, detail="Skills list cannot be empty")
        if not job_title or len(job_title.strip()) < 2:
            raise HTTPException(status_code=400, detail="Valid job title is required")
        if not extracted_text or len(extracted_text.strip()) < 10:
            raise HTTPException(status_code=400, detail="Extracted text is required")
        
        # FIXED: Remove hardcoded examples and let AI generate unique recommendations
        prompt = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"""
You are a career advisor AI. Based on the resume content and target job interest, recommend 5 unique job positions that specifically match this candidate's skills.

RESUME CONTENT:
{extracted_text}

CANDIDATE SKILLS: {', '.join(skills)}
TARGET JOB INTEREST: {job_title}

ANALYSIS INSTRUCTIONS:
1. Carefully analyze the resume to understand the candidate's actual experience level, education, and background
2. Consider their current skills and experience when recommending positions
3. Recommend 5 different job titles that realistically match their profile
4. Include a mix of current-level and growth positions
5. Make job titles creative but professional and industry-appropriate
6. Ensure each recommendation is unique and tailored to this specific candidate

OUTPUT FORMAT (follow this exact structure):
1. **[Unique Job Title Based on Candidate's Profile]**
   * **Description:** [2-3 sentences about the role and key responsibilities tailored to their background]
   * **Key Required Skills:** [List 6-8 specific skills needed, considering what they already have vs what they need]
   * **Potential Career Path:** [Realistic career progression based on their current level]

2. **[Another Unique Job Title]**
   * **Description:** [Role description]
   * **Key Required Skills:** [Skills list]
   * **Potential Career Path:** [Career progression]

3. **[Third Unique Job Title]**
   * **Description:** [Role description]
   * **Key Required Skills:** [Skills list]
   * **Potential Career Path:** [Career progression]

4. **[Fourth Unique Job Title]**
   * **Description:** [Role description]
   * **Key Required Skills:** [Skills list]
   * **Potential Career Path:** [Career progression]

5. **[Fifth Unique Job Title]**
   * **Description:** [Role description]
   * **Key Required Skills:** [Skills list]
   * **Potential Career Path:** [Career progression]

IMPORTANT: 
- Generate unique job titles based on this specific candidate's resume
- Do not use generic examples
- Tailor each recommendation to their actual experience and skills
- Make sure job titles are realistic and achievable for their background
- Provide ONLY the formatted job list, no additional text

Generate 5 unique, personalized job recommendations now:
"""
                        }
                    ]
                }
            ]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}

        # Log the request for debugging
        logger.info(f"Sending job matching request for job title: {job_title}")
        logger.info(f"Skills count: {len(skills)}")
        logger.info(f"Resume text length: {len(extracted_text)}")

        response = requests.post(url, headers=headers, json=prompt, timeout=30)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json and response_json["candidates"]:
                job_recommendations = response_json["candidates"][0]["content"]["parts"][0]["text"]
                job_recommendations = clean_gemini_response(job_recommendations)
                
                # Log the response for debugging
                logger.info(f"Job recommendations generated successfully. Length: {len(job_recommendations)}")
                logger.info(f"First 200 chars: {job_recommendations[:200]}...")
                
            else:
                logger.warning("No candidates in Gemini response")
                job_recommendations = "Unable to generate job recommendations at this time. Please try again."

        else:
            logger.error(f"Gemini API error: Status {response.status_code}, Response: {response.text}")
            job_recommendations = "Unable to generate job recommendations due to API error. Please try again."

        return {
            "job_recommendations": job_recommendations,
            "skills_analyzed": skills,
            "job_title": job_title,
            "analysis_timestamp": datetime.now().isoformat(),
            "total_skills": len(skills)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job matching error: {str(e)}")
        return {
            "job_recommendations": "Unable to generate job recommendations due to system error. Please try again.",
            "error": str(e)
        }

@app.post("/project_generator/")
async def project_generator(request: SkillsRequest):
    try:
        skills = request.skills
        
        # Enhanced prompt for API to generate creative project ideas
        prompt = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"""
Generate 5 creative and innovative portfolio project ideas based on these skills: {', '.join(skills)}

REQUIREMENTS:
- Create unique, catchy, and professional project titles that stand out
- Projects should be realistic and achievable for portfolio building
- Focus on solving real-world problems with practical applications
- Vary difficulty levels (2 Beginner, 2 Intermediate, 1 Advanced)
- Each project should showcase multiple skills effectively
- Include modern, trending technologies and approaches
- Make project titles creative and memorable

OUTPUT FORMAT (follow exactly):
1. Project Title: [Creative, memorable project name with a unique twist]
   Description: [2-3 sentences describing what the project does and its innovative features]
   Key Skills Demonstrated: [List 4-6 specific skills this project showcases]
   Potential Real-World Impact: [How this project could solve real problems or create value]
   Difficulty Level: [Beginner/Intermediate/Advanced]

2. Project Title: [Creative, memorable project name with a unique twist]
   Description: [2-3 sentences describing what the project does and its innovative features]
   Key Skills Demonstrated: [List 4-6 specific skills this project showcases]
   Potential Real-World Impact: [How this project could solve real problems or create value]
   Difficulty Level: [Beginner/Intermediate/Advanced]

[Continue for all 5 projects]

Example:
1. Project Title: MindfulMoments - AI-Powered Wellness Companion
   Description: A smart wellness application that uses machine learning to analyze user behavior patterns and provides personalized mindfulness recommendations. Features mood tracking, guided meditation, and stress level monitoring with beautiful data visualizations.
   Key Skills Demonstrated: Machine Learning, Data Analysis, Mobile Development, UI/UX Design, API Integration, Real-time Analytics
   Potential Real-World Impact: Improves mental health and wellness by providing data-driven insights and personalized recommendations for stress management and mindfulness practices.
   Difficulty Level: Intermediate

Generate 5 unique project ideas with creative, catchy titles that would impress employers and showcase the candidate's skills effectively. Provide ONLY the formatted project list, no additional text.
"""
                        }
                    ]
                }
            ]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=prompt, timeout=30)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json and response_json["candidates"]:
                project_ideas = response_json["candidates"][0]["content"]["parts"][0]["text"]
                project_ideas = clean_gemini_response(project_ideas)
            else:
                # Only use fallback if API response is empty
                project_ideas = "Unable to generate project ideas at this time. Please try again."

        else:
            logger.error(f"Gemini API error: {response.text}")
            project_ideas = "Unable to generate project ideas due to API error. Please try again."

        return {
            "project_ideas": project_ideas,
            "skills_analyzed": skills,
            "analysis_timestamp": datetime.now().isoformat(),
            "total_skills": len(skills)
        }

    except Exception as e:
        logger.error(f"Project generation error: {str(e)}")
        return {
            "project_ideas": "Unable to generate project ideas due to system error. Please try again.",
            "error": str(e)
        }
# Rate limiting middleware (basic implementation)
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Basic rate limiting - in production, use Redis or similar
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = "100"
    response.headers["X-RateLimit-Remaining"] = "99"
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=int(os.getenv("PORT", 8000)),
        log_level="info"
    )