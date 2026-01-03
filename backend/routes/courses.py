from fastapi import APIRouter, HTTPException
from typing import List
import requests
import time
import logging
from datetime import datetime
from backend.config.settings import settings

router = APIRouter()
logger = logging.getLogger(__name__)

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

@router.get("/fetch_courses/{job_title}")
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
                    "key": settings.GOOGLE_API_KEY,
                    "cx": settings.SEARCH_ENGINE_ID,
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

@router.get("/youtube-courses/{job_title}")
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
            "key": settings.YOUTUBE_API_KEY,
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
