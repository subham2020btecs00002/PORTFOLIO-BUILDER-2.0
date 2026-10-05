THEME_RECOMMENDATION_PROMPT = """Analyze the industry and technical skills of a user to recommend a matching portfolio design theme. 
Industry: {industry}
Skills: {skills}

Respond ONLY with a valid JSON block containing these exact fields:
- template: either 'Minimalist' or 'Creative'
- themeColor: either 'default', 'emerald', 'crimson', 'ocean', or 'violet'
- fontFamily: either 'default', 'inter', 'playfair', 'fira-code', or 'outfit'
- borderRadius: either 'default', 'sharp', 'rounded', or 'pill'
- sectionOrder: an array prioritizing sections, e.g., ['projects', 'skills', 'about', 'experience', 'contact']
"""
