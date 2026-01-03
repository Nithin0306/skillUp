def get_analysis_prompt(job_title: str, extracted_text: str) -> dict:
    return {
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

def get_job_matching_prompt(extracted_text: str, skills: list, job_title: str) -> dict:
    return {
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

def get_project_ideas_prompt(skills: list) -> dict:
    return {
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
