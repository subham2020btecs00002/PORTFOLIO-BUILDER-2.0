RESUME_PARSE_PROMPT = """You are an AI resume parser. Extract structured portfolio information from the raw resume text provided below. 
Respond ONLY with a valid JSON block containing these exact fields (use empty strings or empty arrays if a field is not found):

- title: string (the professional headline, e.g., 'Senior Frontend Engineer'. If not explicitly present in the resume, infer a highly matching title based on their work experience and skills, e.g. 'Full Stack Developer')
- description: string (a professional biography or summary of achievements. If no bio or summary section is explicitly written in the resume, generate a compelling 2-3 sentence professional summary synthesizing their career path, passions, and core technical expertise based on their experience and projects)
- skills: list of objects containing:
    * name: string
    * level: string ('Beginner', 'Intermediate', or 'Expert')
    * category: string (e.g. 'Frontend', 'Backend', 'DevOps', 'Languages')
- projects: list of objects containing (Crucial instruction: Only extract independent projects, personal projects, or academic projects. DO NOT extract projects done as part of their work experience/employment at a company; those should stay inside the professionalHistory section as responsibilities or technologies):
    * title: string
    * description: string
    * link: string (GitHub repository or deployment URL. It MUST start with http:// or https://, e.g. 'https://github.com/user/project')
    * technologies: list of strings (tech stack tags)
- education: list of objects containing:
    * collegeName: string
    * degree: string (Must be normalized/mapped to standard formats like: 'B.Tech (Bachelor of Technology)', 'B.E. (Bachelor of Engineering)', 'B.Sc (Bachelor of Science)', 'B.Com (Bachelor of Commerce)', 'B.A. (Bachelor of Arts)', 'B.C.A. (Bachelor of Computer Applications)', 'B.B.A. (Bachelor of Business Administration)', 'M.Tech (Master of Technology)', 'M.C.A. (Master of Computer Applications)', 'M.B.A. (Master of Business Administration)', 'Diploma in Engineering', '12th Grade (Higher Secondary)', '10th Grade (Secondary)')
    * branch: string
    * cgpaOrPercentage: string (Must be a clean float/decimal string e.g. '7.35' or '8.5' without suffix 'cgpa' or 'CGPA', or a percentage string like '85%' or '85.5%')
    * yearOfJoining: string (date string, e.g., '2019-08-01')
    * yearOfPassing: string (date string, e.g., '2023-05-30')
- professionalHistory: list of objects containing:
    * companyName: string
    * position: string
    * responsibility: string (description of duties, projects, or bullet points)
    * isCurrentEmployee: boolean
    * yearOfJoining: string (date string, e.g., '2023-06-01')
    * yearOfLeaving: string (date string, e.g., '2026-07-04' or 'Present' if current)
    * technologies: list of strings
- portfolioLinks: object containing:
    * github: string (Full URL starting with https://, e.g. 'https://github.com/username')
    * leetcode: string (Full URL starting with https://, e.g. 'https://leetcode.com/username')
    * gfg: string (Full URL starting with https://, e.g. 'https://www.geeksforgeeks.org/user/username/')
    * linkedin: string (Full URL starting with https://, e.g. 'https://linkedin.com/in/username')

Resume Text:
{resume_text}
"""
