import os
import re
from datetime import datetime
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


def clean_cgpa_or_percentage(val: str) -> str:
    if not val:
        return ""
    val_str = str(val).strip()
    match = re.search(r"(\d+(?:\.\d+)?)", val_str)
    if match:
        num_str = match.group(1)
        try:
            num = float(num_str)
            if "%" in val_str or "percent" in val_str.lower() or num > 10.0:
                if num > 100.0:
                    num = 100.0
                if num == int(num):
                    return f"{int(num)}%"
                else:
                    return f"{num:.2f}".rstrip('0').rstrip('.') + "%"
            else:
                if num > 10.0:
                    num = 10.0
                if num == int(num):
                    return f"{int(num)}"
                else:
                    return f"{num:.2f}".rstrip('0').rstrip('.')
        except ValueError:
            pass
    return ""


def normalize_degree(degree_str: str) -> str:
    if not degree_str:
        return ""
    d_clean = degree_str.strip().lower()
    
    if "bca" in d_clean or "bachelor of computer application" in d_clean or "bachelors of computer application" in d_clean:
        return "B.C.A. (Bachelor of Computer Applications)"
    if "btech" in d_clean or "b.tech" in d_clean or "bachelor of technology" in d_clean or "bachelors of technology" in d_clean:
        return "B.Tech (Bachelor of Technology)"
    if "b.e." in d_clean or "be" == d_clean or "bachelor of engineering" in d_clean or "bachelors of engineering" in d_clean:
        return "B.E. (Bachelor of Engineering)"
    if "bsc" in d_clean or "b.sc" in d_clean or "bachelor of science" in d_clean or "bachelors of science" in d_clean:
        return "B.Sc (Bachelor of Science)"
    if "bcom" in d_clean or "b.com" in d_clean or "bachelor of commerce" in d_clean or "bachelors of commerce" in d_clean:
        return "B.Com (Bachelor of Commerce)"
    if "b.a." in d_clean or "ba" == d_clean or "bachelor of arts" in d_clean or "bachelors of arts" in d_clean:
        return "B.A. (Bachelor of Arts)"
    if "bba" in d_clean or "b.b.a" in d_clean or "bachelor of business administration" in d_clean:
        return "B.B.A. (Bachelor of Business Administration)"
    if "mtech" in d_clean or "m.tech" in d_clean or "master of technology" in d_clean or "masters of technology" in d_clean:
        return "M.Tech (Master of Technology)"
    if "m.e." in d_clean or "me" == d_clean or "master of engineering" in d_clean or "masters of engineering" in d_clean:
        return "M.E. (Master of Engineering)"
    if "msc" in d_clean or "m.sc" in d_clean or "master of science" in d_clean or "masters of science" in d_clean:
        return "M.Sc (Master of Science)"
    if "mca" in d_clean or "master of computer application" in d_clean or "masters of computer application" in d_clean:
        return "M.C.A. (Master of Computer Applications)"
    if "mba" in d_clean or "m.b.a" in d_clean or "master of business administration" in d_clean:
        return "M.B.A. (Master of Business Administration)"
    if "m.a." in d_clean or "ma" == d_clean or "master of arts" in d_clean or "masters of arts" in d_clean:
        return "M.A. (Master of Arts)"
    if "phd" in d_clean or "ph.d" in d_clean or "doctor of philosophy" in d_clean:
        return "Ph.D (Doctor of Philosophy)"
    if "diploma" in d_clean:
        if "computer" in d_clean:
            return "Diploma in Computer Applications"
        return "Diploma in Engineering"
    if "12th" in d_clean or "higher secondary" in d_clean or "hsc" in d_clean:
        return "12th Grade (Higher Secondary)"
    if "10th" in d_clean or "secondary" in d_clean or "ssc" in d_clean:
        return "10th Grade (Secondary)"
    
    return degree_str.strip()


def clean_link(link: str, platform: str = None) -> str:
    if not link:
        return ""
    l_str = str(link).strip()
    if not l_str:
        return ""
        
    if l_str.startswith("http://") or l_str.startswith("https://"):
        return l_str
        
    if platform and "." not in l_str and "/" not in l_str:
        if platform == "github":
            return f"https://github.com/{l_str}"
        elif platform == "linkedin":
            return f"https://www.linkedin.com/in/{l_str}"
        elif platform == "leetcode":
            return f"https://leetcode.com/{l_str}"
        elif platform == "gfg":
            return f"https://www.geeksforgeeks.org/user/{l_str}/"
            
    return f"https://{l_str}"


def normalize_date(date_str: str, default_year: int = 2020) -> str:
    if not date_str:
        return ""
    d_str = str(date_str).strip()
    if not d_str:
        return ""
        
    if re.match(r"^\d{4}-\d{2}-\d{2}$", d_str):
        return d_str
        
    year_match = re.search(r"\b(19\d{2}|20\d{2})\b", d_str)
    year = int(year_match.group(1)) if year_match else default_year
    
    d_lower = d_str.lower()
    month = 1
    months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    for idx, m in enumerate(months):
        if m in d_lower:
            month = idx + 1
            break
            
    return f"{year:04d}-{month:02d}-01"


def post_process_resume_data(data: dict) -> dict:
    if not isinstance(data, dict):
        return data

    links = data.get("portfolioLinks", {})
    if isinstance(links, dict):
        for platform in ["github", "leetcode", "gfg", "linkedin"]:
            if platform in links:
                links[platform] = clean_link(links[platform], platform)
        data["portfolioLinks"] = links

    projects = data.get("projects", [])
    if isinstance(projects, list):
        for proj in projects:
            if isinstance(proj, dict) and "link" in proj:
                proj["link"] = clean_link(proj["link"])
        data["projects"] = projects

    education = data.get("education", [])
    if isinstance(education, list):
        for edu in education:
            if isinstance(edu, dict):
                if "cgpaOrPercentage" in edu:
                    edu["cgpaOrPercentage"] = clean_cgpa_or_percentage(edu["cgpaOrPercentage"])
                if "degree" in edu:
                    edu["degree"] = normalize_degree(edu["degree"])
                if "yearOfJoining" in edu:
                    edu["yearOfJoining"] = normalize_date(edu["yearOfJoining"], 2019)
                if "yearOfPassing" in edu:
                    edu["yearOfPassing"] = normalize_date(edu["yearOfPassing"], 2023)
                
                y_join = edu.get("yearOfJoining")
                y_pass = edu.get("yearOfPassing")
                if y_join and y_pass:
                    if y_join >= y_pass:
                        try:
                            join_year = int(y_join.split("-")[0])
                            edu["yearOfPassing"] = f"{join_year + 4}-05-30"
                        except Exception:
                            pass
        data["education"] = education

    history = data.get("professionalHistory", [])
    if isinstance(history, list):
        for hist in history:
            if isinstance(hist, dict):
                y_leaving = hist.get("yearOfLeaving", "")
                if y_leaving and ("present" in str(y_leaving).lower() or "current" in str(y_leaving).lower() or hist.get("isCurrentEmployee") is True):
                    hist["isCurrentEmployee"] = True
                    hist["yearOfLeaving"] = ""
                else:
                    if "yearOfLeaving" in hist:
                        hist["yearOfLeaving"] = normalize_date(hist["yearOfLeaving"], 2026)
                        
                if "yearOfJoining" in hist:
                    hist["yearOfJoining"] = normalize_date(hist["yearOfJoining"], 2023)
                
                y_join = hist.get("yearOfJoining")
                y_leave = hist.get("yearOfLeaving")
                if y_join and y_leave and not hist.get("isCurrentEmployee"):
                    if y_join >= y_leave:
                        try:
                            join_year = int(y_join.split("-")[0])
                            hist["yearOfLeaving"] = f"{join_year + 2}-12-31"
                        except Exception:
                            pass
        data["professionalHistory"] = history

    return data


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
            "- projects: list of objects containing (Crucial instruction: Only extract independent projects, personal projects, or academic projects. DO NOT extract projects done as part of their work experience/employment at a company; those should stay inside the professionalHistory section as responsibilities or technologies):\n"
            "    * title: string\n"
            "    * description: string\n"
            "    * link: string (GitHub repository or deployment URL. It MUST start with http:// or https://, e.g. 'https://github.com/user/project')\n"
            "    * technologies: list of strings (tech stack tags)\n"
            "- education: list of objects containing:\n"
            "    * collegeName: string\n"
            "    * degree: string (Must be normalized/mapped to standard formats like: 'B.Tech (Bachelor of Technology)', 'B.E. (Bachelor of Engineering)', 'B.Sc (Bachelor of Science)', 'B.Com (Bachelor of Commerce)', 'B.A. (Bachelor of Arts)', 'B.C.A. (Bachelor of Computer Applications)', 'B.B.A. (Bachelor of Business Administration)', 'M.Tech (Master of Technology)', 'M.C.A. (Master of Computer Applications)', 'M.B.A. (Master of Business Administration)', 'Diploma in Engineering', '12th Grade (Higher Secondary)', '10th Grade (Secondary)')\n"
            "    * branch: string\n"
            "    * cgpaOrPercentage: string (Must be a clean float/decimal string e.g. '7.35' or '8.5' without suffix 'cgpa' or 'CGPA', or a percentage string like '85%' or '85.5%')\n"
            "    * yearOfJoining: string (date string, e.g., '2019-08-01')\n"
            "    * yearOfPassing: string (date string, e.g., '2023-05-30')\n"
            "- professionalHistory: list of objects containing:\n"
            "    * companyName: string\n"
            "    * position: string\n"
            "    * responsibility: string (description of duties, projects, or bullet points)\n"
            "    * isCurrentEmployee: boolean\n"
            "    * yearOfJoining: string (date string, e.g., '2023-06-01')\n"
            "    * yearOfLeaving: string (date string, e.g., '2026-07-04' or 'Present' if current)\n"
            "    * technologies: list of strings\n"
            "- portfolioLinks: object containing:\n"
            "    * github: string (Full URL starting with https://, e.g. 'https://github.com/username')\n"
            "    * leetcode: string (Full URL starting with https://, e.g. 'https://leetcode.com/username')\n"
            "    * gfg: string (Full URL starting with https://, e.g. 'https://www.geeksforgeeks.org/user/username/')\n"
            "    * linkedin: string (Full URL starting with https://, e.g. 'https://linkedin.com/in/username')\n\n"
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
        raw_data = json.loads(text)
        return post_process_resume_data(raw_data)
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
