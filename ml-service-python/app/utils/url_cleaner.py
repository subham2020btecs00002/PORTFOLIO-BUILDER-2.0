def clean_link(link: str, platform: str = None) -> str:
    """
    Sanitizes social and repository URLs, prepending HTTPS and resolving handles to full URLs.
    """
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
