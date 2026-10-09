import pytest
from app.utils.normalizers import clean_cgpa_or_percentage, normalize_degree, normalize_date
from app.utils.url_cleaner import clean_link

def test_clean_cgpa():
    assert clean_cgpa_or_percentage("8.5 CGPA") == "8.5"
    assert clean_cgpa_or_percentage("9.0 / 10") == "9"
    assert clean_cgpa_or_percentage("85.5 %") == "85.5%"
    assert clean_cgpa_or_percentage("85 percent") == "85%"
    assert clean_cgpa_or_percentage("77%") == "77%"
    assert clean_cgpa_or_percentage("8.78") == "8.78"
    assert clean_cgpa_or_percentage("3.8/4.0") == "3.8/4"
    assert clean_cgpa_or_percentage("A+") == "A+"
    assert clean_cgpa_or_percentage("Distinction") == "Distinction"
    assert clean_cgpa_or_percentage("") == ""

def test_normalize_degree():
    assert normalize_degree("B.Tech in CSE") == "B.Tech (Bachelor of Technology)"
    assert normalize_degree("bca") == "B.C.A. (Bachelor of Computer Applications)"
    assert normalize_degree("Master of Computer Application") == "M.C.A. (Master of Computer Applications)"
    assert normalize_degree("Diploma in Civil") == "Diploma in Engineering"
    assert normalize_degree("Unknown Specialty") == "Unknown Specialty"

def test_normalize_date():
    assert normalize_date("2021-05-15") == "2021-05-15"
    assert normalize_date("May 2021") == "2021-05-01"
    assert normalize_date("2023") == "2023-01-01"
    assert normalize_date("") == ""

def test_clean_link():
    assert clean_link("https://github.com/user") == "https://github.com/user"
    assert clean_link("github.com/user") == "https://github.com/user"
    assert clean_link("johndoe", "github") == "https://github.com/johndoe"
    assert clean_link("janedoe", "linkedin") == "https://www.linkedin.com/in/janedoe"
    assert clean_link("") == ""
