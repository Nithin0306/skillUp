from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import fitz  # PyMuPDF
from dotenv import load_dotenv
import os
import requests

app = FastAPI(root_path="/api")



@app.get("/")
def home():
    return {"message": "Hello World"}

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://skill-up-topaz.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
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

# Function to extract limited text from PDF
def extract_text_from_pdf(file_content):
    try:
        with fitz.open(stream=file_content, filetype="pdf") as pdf:
            text = "\n".join([page.get_text("text") for page in pdf])
        return text[:3000]  # Limit to first 3000 characters
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    file_content = await file.read()
    text = extract_text_from_pdf(file_content)
    return {"text": text}

@app.post("/analyze_resume/")
async def analyze_resume(file: UploadFile = File(...), job_title: str = Form(...)):
    try:
        resume_content = await file.read()
        extracted_text = extract_text_from_pdf(resume_content)

        prompt = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"Given this resume text, extract the key skills and compare them to the required skills for a {job_title}. Do not include explanations. Just list the important missing skills clearly. Resume:\n\n{extracted_text}\n\nProvide the missing skills in a bullet-point format and ignore unwanted characters like *."
                        }
                    ]
                }
            ]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=prompt)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json:
                skill_gap = response_json["candidates"][0]["content"]["parts"][0]["text"]
            else:
                skill_gap = "No missing skills found or response format changed."

        else:
            skill_gap = f"Error from API: {response.text}"

        return {"missing_skills": skill_gap}

    except Exception as e:
        return {"error": str(e)}

@app.get("/fetch_courses/{skill}")
def fetch_courses(skill: str):
    try:
        # For Google Custom Search API (to search Coursera)
        coursera_search_url = "https://www.googleapis.com/customsearch/v1"
        coursera_params = {
            "key": google_key,
            "cx": SEARCH_ENGINE_ID,
            "q": f"Coursera course for {skill}",
            "num": 5
        }

        coursera_response = requests.get(coursera_search_url, params=coursera_params)
        coursera_response.raise_for_status()
        coursera_data = coursera_response.json()
        
        # Print response for debugging
        print(f"Coursera API Response: {coursera_data}")

        # For Udemy courses (using the same Google Custom Search)
        udemy_search_url = "https://www.googleapis.com/customsearch/v1"
        udemy_params = {
            "key": google_key,
            "cx": SEARCH_ENGINE_ID,
            "q": f"Udemy course for {skill}",
            "num": 5
        }

        udemy_response = requests.get(udemy_search_url, params=udemy_params)
        udemy_response.raise_for_status()
        udemy_data = udemy_response.json()
        
        # Print response for debugging
        print(f"Udemy API Response: {udemy_data}")

        # Process Coursera results
        coursera_courses = []
        if "items" in coursera_data:
            for item in coursera_data["items"]:
                if "coursera.org" in item.get("link", ""):
                    coursera_courses.append({
                        "title": item.get("title", "Untitled Course"),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                        "platform": "Coursera"
                    })

        # Process Udemy results
        udemy_courses = []
        if "items" in udemy_data:
            for item in udemy_data["items"]:
                if "udemy.com" in item.get("link", ""):
                    udemy_courses.append({
                        "title": item.get("title", "Untitled Course"),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", ""),
                        "platform": "Udemy"
                    })

        # Combine results and add dummy data if no results
        all_courses = coursera_courses + udemy_courses
        
        # If no results found, add some sample courses
        if not all_courses:
            print(f"No courses found for {skill}, adding sample courses")
            all_courses = [
                {
                    "title": f"Introduction to {skill}",
                    "link": "https://www.coursera.org/",
                    "snippet": f"Learn the fundamentals of {skill} with this comprehensive course",
                    "platform": "Coursera"
                },
                {
                    "title": f"Advanced {skill} Masterclass",
                    "link": "https://www.udemy.com/",
                    "snippet": f"Take your {skill} skills to the next level with expert instruction",
                    "platform": "Udemy"
                }
            ]

        return {"courses": all_courses}

    except requests.exceptions.RequestException as req_err:
        print(f"Request error occurred: {req_err}")
        # Return sample courses if API call fails
        sample_courses = [
            {
                "title": f"Introduction to {skill}",
                "link": "https://www.coursera.org/",
                "snippet": f"Learn the fundamentals of {skill} with this comprehensive course",
                "platform": "Coursera"
            },
            {
                "title": f"Advanced {skill} Masterclass",
                "link": "https://www.udemy.com/",
                "snippet": f"Take your {skill} skills to the next level with expert instruction",
                "platform": "Udemy"
            }
        ]
        return {"courses": sample_courses}
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        # Return sample courses if any other error occurs
        sample_courses = [
            {
                "title": f"Introduction to {skill}",
                "link": "https://www.coursera.org/",
                "snippet": f"Learn the fundamentals of {skill} with this comprehensive course",
                "platform": "Coursera"
            },
            {
                "title": f"Advanced {skill} Masterclass",
                "link": "https://www.udemy.com/",
                "snippet": f"Take your {skill} skills to the next level with expert instruction",
                "platform": "Udemy"
            }
        ]
        return {"courses": sample_courses}

@app.get("/youtube-courses/{skill}")
def get_youtube_courses(skill: str):
    youtube_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={skill}+course&type=video&key={youtube_key}&maxResults=10"

    try:
        response = requests.get(youtube_url)
        response.raise_for_status()
        data = response.json()

        if "items" not in data or not data["items"]:
            return {"videos": [], "message": "No YouTube videos found for this skill."}

        videos = [
            {
                "title": item["snippet"]["title"],
                "video_id": item["id"]["videoId"],
                "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
                "channel": item["snippet"]["channelTitle"],
                "link": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
            }
            for item in data.get("items", []) if "videoId" in item["id"]
        ]

        return {"videos": videos}

    except requests.exceptions.HTTPError as http_err:
        return {"error": f"HTTP error occurred: {http_err}"}
    except requests.exceptions.RequestException as req_err:
        return {"error": f"Request error occurred: {req_err}"}
    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

@app.post("/job_matching/")
async def job_matching(request: SkillsRequest):
    try:
        skills = request.skills
        prompt = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"Given these skills: {', '.join(skills)}, recommend 5 job roles that best match these skills. "
                            "For each role, provide:\n"
                            "1. Job Title\n"
                            "2. Brief Description\n"
                            "3. Key Required Skills\n"
                            "4. Potential Career Path\n"
                            "Format the response as a clear, structured list."
                        }
                    ]
                }
            ]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=prompt)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json:
                job_recommendations = response_json["candidates"][0]["content"]["parts"][0]["text"]
            else:
                job_recommendations = "No job recommendations found."

        else:
            job_recommendations = f"Error from API: {response.text}"

        return {"job_recommendations": job_recommendations}

    except Exception as e:
        return {"error": str(e)}

@app.post("/project_generator/")
async def project_generator(request: SkillsRequest):
    try:
        skills = request.skills
        prompt = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"Given these skills: {', '.join(skills)}, suggest 5 real-world projects "
                            "that would help build a strong portfolio. For each project, provide:\n"
                            "1. Catchy Project Title \n"
                            "2. Project Description\n"
                            "3. Key Skills Demonstrated\n"
                            "4. Potential Real-World Impact\n"
                            "5. Difficulty Level (Beginner/Intermediate/Advanced)\n"
                            "Format the response as a clear, structured list."
                        }
                    ]
                }
            ]
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}"
        headers = {"Content-Type": "application/json"}

        response = requests.post(url, headers=headers, json=prompt)

        if response.status_code == 200:
            response_json = response.json()
            
            if "candidates" in response_json:
                project_ideas = response_json["candidates"][0]["content"]["parts"][0]["text"]
            else:
                project_ideas = "No project ideas found."

        else:
            project_ideas = f"Error from API: {response.text}"

        return {"project_ideas": project_ideas}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)