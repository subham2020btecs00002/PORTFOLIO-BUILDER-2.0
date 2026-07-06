import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environments
load_dotenv()

# Configure Gemini SDK
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GEMINI_API_KEY is not set in environment variables.")

def enhance_text(text: str) -> str:
    """
    Polishes and rephrases portfolio text (bio, experience, project descriptions)
    to sound professional and engaging.
    """
    if not api_key:
        return f"[Simulated Enhance] {text} (API Key not set)"
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "You are an expert resume writer and career coach. Rewrite the following portfolio description "
            "to make it sound highly professional, active, results-oriented, and engaging. "
            "Keep the length comparable to the input, do not introduce fake details, and do not wrap the response in quotes:\n\n"
            f"{text}"
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error in enhance_text: {e}")
        return f"Error polishing text: {str(e)}"

def recommend_theme(industry: str, skills: list) -> dict:
    """
    Suggests layout templates, typography, and color schemes based on user industry/skills.
    """
    if not api_key:
        return {
            "template": "Minimalist",
            "themeColor": "default",
            "fontFamily": "default",
            "borderRadius": "default",
            "sectionOrder": ["about", "skills", "experience", "projects", "contact"]
        }

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "Analyze the industry and technical skills of a user to recommend a matching portfolio design theme. "
            f"Industry: {industry}\n"
            f"Skills: {', '.join(skills)}\n\n"
            "Respond ONLY with a valid JSON block containing these exact fields:\n"
            "- template: either 'Minimalist' or 'Creative'\n"
            "- themeColor: either 'default', 'emerald', 'crimson', 'ocean', or 'violet'\n"
            "- fontFamily: either 'default', 'inter', 'playfair', 'fira-code', or 'outfit'\n"
            "- borderRadius: either 'default', 'sharp', 'rounded', or 'pill'\n"
            "- sectionOrder: an array prioritizing sections, e.g., ['projects', 'skills', 'about', 'experience', 'contact']\n\n"
            "Format: Just the JSON object, no markdown, no ```json formatting."
        )
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up any potential markdown wraps if Gemini ignored the instruction
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        import json
        return json.loads(text)
    except Exception as e:
        print(f"Gemini API Error in recommend_theme: {e}")
        # Default fallback config
        return {
            "template": "Minimalist",
            "themeColor": "ocean",
            "fontFamily": "inter",
            "borderRadius": "rounded",
            "sectionOrder": ["about", "skills", "experience", "projects", "contact"]
        }

def parse_resume_text(resume_text: str) -> dict:
    """
    Leverages Gemini to extract structured portfolio data from raw resume text.
    """
    if not api_key:
        return {}

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "You are an AI resume parser. Extract structured portfolio information from the raw resume text provided below. "
            "Respond ONLY with a valid JSON block containing these exact fields (use empty strings or empty arrays if a field is not found):\n\n"
            "- title: string (the professional headline, e.g., 'Senior Frontend Engineer'. If not explicitly present in the resume, infer a highly matching title based on their work experience and skills, e.g. 'Full Stack Developer')\n"
            "- description: string (a professional biography or summary of achievements. If no bio or summary section is explicitly written in the resume, generate a compelling 2-3 sentence professional summary synthesizing their career path, passions, and core technical expertise based on their experience and projects)\n"
            "- skills: list of objects containing:\n"
            "    * name: string\n"
            "    * level: string ('Beginner', 'Intermediate', or 'Expert')\n"
            "    * category: string (e.g. 'Frontend', 'Backend', 'DevOps', 'Languages')\n"
            "- projects: list of objects containing:\n"
            "    * title: string\n"
            "    * description: string\n"
            "    * link: string (github or deploy link)\n"
            "    * technologies: list of strings (tech stack tags)\n"
            "- education: list of objects containing:\n"
            "    * collegeName: string\n"
            "    * degree: string\n"
            "    * branch: string\n"
            "    * cgpaOrPercentage: string\n"
            "    * yearOfJoining: string (date string, e.g., '2019-08-01')\n"
            "    * yearOfPassing: string (date string, e.g., '2023-05-30')\n"
            "- professionalHistory: list of objects containing:\n"
            "    * companyName: string\n"
            "    * position: string\n"
            "    * responsibility: string (description of duties, projects, or bullet points)\n"
            "    * isCurrentEmployee: boolean\n"
            "    * yearOfJoining: string (date string, e.g., '2023-06-01')\n"
            "    * yearOfLeaving: string (date string, e.g., '2026-07-04')\n"
            "    * technologies: list of strings\n"
            "- portfolioLinks: object containing:\n"
            "    * github: string (e.g. github URL or username)\n"
            "    * leetcode: string (e.g. leetcode URL or username)\n"
            "    * gfg: string (GeeksforGeeks URL or username)\n"
            "    * linkedin: string (e.g. LinkedIn URL or username)\n\n"
            "Resume Text:\n"
            f"{resume_text}\n\n"
            "Format: Just return raw JSON, no markdown, no ```json formatting."
        )
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up any potential markdown wraps if Gemini ignored the instructions
        if text.startswith("```"):
            lines = text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            text = "\n".join(lines).strip()
            
        import json
        return json.loads(text)
    except Exception as e:
        print(f"Gemini API Error in parse_resume_text: {e}")
        return {
            "title": "",
            "description": "",
            "skills": [],
            "projects": [],
            "education": [],
            "professionalHistory": [],
            "portfolioLinks": {
                "github": "",
                "leetcode": "",
                "gfg": "",
                "linkedin": ""
            }
        }
