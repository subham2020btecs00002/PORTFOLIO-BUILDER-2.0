import re

def clean_cgpa_or_percentage(val: str) -> str:
    """
    Normalizes GPA, CGPA, scale ratios, letter grades, or percentage into a standard format.
    Example: '8.5 CGPA' -> '8.5', '9.0 / 10' -> '9', '3.8/4.0' -> '3.8/4', '85.5%' -> '85.5%', 'A+' -> 'A+'.
    """
    if not val:
        return ""
    val_str = str(val).strip()

    # 1. Letter grades and honors (e.g. A+, A, A-, B+, Distinction, First Class, O)
    grade_match = re.search(r"^(?:Grade\s*)?([A-D][+-]?|[OS]|Distinction|First\s+Class|First\s+Division|Honours|Honors)$", val_str, re.IGNORECASE)
    if grade_match:
        matched = grade_match.group(1).strip()
        return matched.upper() if len(matched) <= 2 else matched.title()

    # 2. Scale ratios (e.g. 3.8/4.0, 9.0/10, 4.5/5.0)
    ratio_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:/|\s*out of\s*)\s*(\d+(?:\.\d+)?)", val_str, re.IGNORECASE)
    if ratio_match:
        try:
            num = float(ratio_match.group(1))
            scale = float(ratio_match.group(2))
            if scale == 10.0:
                return f"{int(num)}" if num == int(num) else f"{num:.2f}".rstrip("0").rstrip(".")
            else:
                num_fmt = f"{int(num)}" if num == int(num) else f"{num:.2f}".rstrip("0").rstrip(".")
                scale_fmt = f"{int(scale)}" if scale == int(scale) else f"{scale:.1f}".rstrip("0").rstrip(".")
                return f"{num_fmt}/{scale_fmt}"
        except ValueError:
            pass

    # 3. Numeric extraction (percentages or standard CGPA)
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
                    return f"{num:.2f}".rstrip("0").rstrip(".") + "%"
            else:
                if num > 10.0:
                    num = 10.0
                if num == int(num):
                    return f"{int(num)}"
                else:
                    return f"{num:.2f}".rstrip("0").rstrip(".")
        except ValueError:
            pass
    return ""

def normalize_degree(degree_str: str) -> str:
    """
    Maps freeform degree titles to standardized naming conventions.
    """
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

def normalize_date(date_str: str, default_year: int = 2020) -> str:
    """
    Parses messy date expressions into standard YYYY-MM-DD format.
    """
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
