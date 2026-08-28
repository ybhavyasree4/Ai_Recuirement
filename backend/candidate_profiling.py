import re
from database import SessionLocal
from models import Candidate, CandidateSkill

SKILLS = [
    "Python", "Java", "SQL", "HTML", "CSS", "JavaScript", "C", "C++", "C#",
    "React", "Node.js", "FastAPI", "Django", "Flask", "Pandas", "NumPy",
    "Scikit-learn", "TensorFlow", "PyTorch", "Machine Learning",
    "Deep Learning", "Natural Language Processing", "NLP", "Generative AI",
    "Large Language Models", "LLMs", "LangChain", "Prompt Engineering",
    "Streamlit", "Matplotlib", "Seaborn", "Git", "GitHub", "PostgreSQL",
    "MySQL", "MongoDB", "Docker", "AWS", "Azure", "Spring Boot"
]

LANGUAGES = [
    "English", "Telugu", "Hindi", "Tamil", "Kannada",
    "Malayalam", "Marathi", "Bengali", "Gujarati",
    "Punjabi", "Urdu"
]

POSITIONS = [
    "machine learning engineer", "software engineer",
    "software developer", "full-stack developer",
    "full stack developer", "frontend developer",
    "front-end developer", "backend developer",
    "back-end developer", "python developer",
    "java developer", "ai engineer", "ai developer",
    "data scientist", "data analyst", "data engineer",
    "web developer", "ml engineer", "devops engineer",
    "cloud engineer", "engineer", "developer", "intern"
]

SECTIONS = {
    "education": [
        "education", "academic", "academics",
        "educational qualification", "educational qualifications",
        "academic qualification", "academic qualifications"
    ],
    "experience": [
        "experience", "work experience",
        "professional experience", "employment",
        "employment history", "work history",
        "internship", "internships"
    ],
    "projects": [
        "projects", "academic projects",
        "personal projects", "project experience"
    ],
    "summary": [
        "objective", "career objective", "profile",
        "summary", "professional summary", "career summary"
    ],
    "certification": [
        "certification", "certifications",
        "certificates", "achievements"
    ]
}


def clean(text):
    return re.sub(r"\s+", " ", text or "").strip(" •:-|")


def is_heading(line):
    line = clean(line).lower()

    for group in SECTIONS.values():
        for name in group:
            if re.fullmatch(
                rf"{re.escape(name)}\s*[:\-]?",
                line
            ):
                return True

    return False


def get_section(text, names):

    lines = text.splitlines()
    start = None

    for i, line in enumerate(lines):

        value = clean(line).lower()

        if any(
            re.fullmatch(
                rf"{re.escape(name)}\s*[:\-]?",
                value
            )
            for name in names
        ):
            start = i + 1
            break

    if start is None:
        return ""

    result = []

    for line in lines[start:]:

        value = clean(line)

        if value and is_heading(value):
            break

        if value:
            result.append(value)

    return "\n".join(result)


def find_matches(text, items):

    found = []

    for item in items:

        if re.search(
            rf"(?<!\w){re.escape(item)}(?!\w)",
            text,
            re.I
        ):
            found.append(item)

    return list(dict.fromkeys(found))


def extract_degree(text):

    patterns = [
        ("B.Tech", [
            r"\bb\.?\s*tech\.?\b",
            r"\bbtech\b",
            r"bachelor\s+of\s+technology"
        ]),
        ("M.Tech", [
            r"\bm\.?\s*tech\.?\b",
            r"\bmtech\b",
            r"master\s+of\s+technology"
        ]),
        ("B.E", [
            r"\bb\.?\s*e\.?\b",
            r"bachelor\s+of\s+engineering"
        ]),
        ("M.E", [
            r"\bm\.?\s*e\.?\b",
            r"master\s+of\s+engineering"
        ]),
        ("B.Sc", [
            r"\bb\.?\s*sc\.?\b",
            r"\bbsc\b",
            r"bachelor\s+of\s+science"
        ]),
        ("M.Sc", [
            r"\bm\.?\s*sc\.?\b",
            r"\bmsc\b",
            r"master\s+of\s+science"
        ]),
        ("BCA", [
            r"\bbca\b",
            r"bachelor\s+of\s+computer\s+applications"
        ]),
        ("MCA", [
            r"\bmca\b",
            r"master\s+of\s+computer\s+applications"
        ]),
        ("MBA", [
            r"\bmba\b",
            r"master\s+of\s+business\s+administration"
        ]),
        ("BBA", [
            r"\bbba\b",
            r"bachelor\s+of\s+business\s+administration"
        ]),
        ("PhD", [
            r"\bph\.?\s*d\.?\b",
            r"doctor\s+of\s+philosophy"
        ]),
        ("Diploma", [
            r"\bdiploma\b"
        ])
    ]

    for degree, patterns in patterns:

        for pattern in patterns:

            if re.search(
                pattern,
                text,
                re.I
            ):
                return degree

    return "Not available"


def extract_field(text):

    fields = [
        "Artificial Intelligence and Data Science",
        "Computer Science and Engineering",
        "Computer Science & Engineering",
        "Electronics and Communication Engineering",
        "Electrical and Electronics Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Computer Science",
        "Information Technology",
        "Artificial Intelligence",
        "Data Science",
        "Computer Engineering",
        "Information Science",
        "Electronics and Communication",
        "Electrical Engineering",
        "Business Administration",
        "Commerce"
    ]

    for field in sorted(fields, key=len, reverse=True):

        if re.search(
            rf"(?<!\w){re.escape(field)}(?!\w)",
            text,
            re.I
        ):
            return field

    return "Not available"


def extract_result(text):

    patterns = [
        r"\b(?:cgpa|gpa)\s*[:=\-]?\s*(\d+(?:\.\d+)?)",
        r"\b(\d+(?:\.\d+)?)\s*(?:cgpa|gpa)\b",
        r"\b(\d+(?:\.\d+)?)\s*/\s*10\b",
        r"\b(\d+(?:\.\d+)?)\s+out\s+of\s+10\b",
        r"\b(?:percentage|percent)\s*[:=\-]?\s*(\d+(?:\.\d+)?)",
        r"\b(\d+(?:\.\d+)?)\s*%",
        r"\b(?:grade)\s*[:=\-]?\s*([A-F][+]?)\b",
        r"\b(first\s+class|second\s+class|distinction)\b"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:

            value = match.group(1).strip()

            if "%" in match.group(0):
                return value + "%"

            return value

    return "Not available"


def extract_year(text):

    patterns = [
        r"\b(?:19|20)\d{2}\s*[-–—]\s*((?:19|20)\d{2})\b",
        r"\b(?:19|20)\d{2}\s+to\s+((?:19|20)\d{2})\b",
        r"(?:passing\s+year|graduation\s+year|"
        r"year\s+of\s+graduation|graduated|completed)"
        r".{0,50}?\b((?:19|20)\d{2})\b"
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            re.I
        )

        if match:
            return match.group(1)

    years = re.findall(
        r"\b(?:19|20)\d{2}\b",
        text
    )

    return max(years) if years else "Not available"


def extract_institution(text):

    bad_words = [
        "appreciation", "certificate", "award",
        "held on", "organized", "participated",
        "event", "workshop", "seminar",
        "conference", "achievement"
    ]

    for line in text.splitlines():

        line = clean(line)

        if not line:
            continue

        low = line.lower()

        if any(word in low for word in bad_words):
            continue

        if not re.search(
            r"\b(university|college|institute|school|academy)\b",
            line,
            re.I
        ):
            continue

        line = re.sub(
            r"\b(?:19|20)\d{2}\b",
            "",
            line
        )

        line = re.sub(
            r"\b(?:cgpa|gpa)\s*[:=\-]?\s*\d+(?:\.\d+)?",
            "",
            line,
            flags=re.I
        )

        line = clean(line)

        if 5 <= len(line) <= 150:
            return line

    return "Not available"


def extract_education(text):

    education = get_section(
        text,
        SECTIONS["education"]
    )

    search_text = education if education else text

    degree = extract_degree(search_text)

    if degree == "Not available":
        degree = extract_degree(text)

    field = extract_field(search_text)

    if field == "Not available":
        field = extract_field(text)

    result = extract_result(search_text)

    if result == "Not available":
        result = extract_result(text)

    year = extract_year(search_text)

    if year == "Not available":
        year = extract_year(text)

    institution = extract_institution(search_text)

    if institution == "Not available":
        institution = extract_institution(text)

    return {
        "institution": institution,
        "degree": degree,
        "field": field,
        "result": result,
        "year": year
    }


def extract_experience(text):

    experience = get_section(
        text,
        SECTIONS["experience"]
    )

    if not experience:
        return {
            "company": "Not available",
            "url": "Not available",
            "responsibilities": "Not available",
            "role": "Not available"
        }

    companies = []
    urls = []
    responsibilities = []
    roles = []

    role_pattern = "|".join(
        re.escape(x)
        for x in POSITIONS
    )

    for line in experience.splitlines():

        line = clean(line)

        if not line:
            continue

        urls += re.findall(
            r"https?://[^\s,]+",
            line,
            re.I
        )

        roles += re.findall(
            rf"(?<!\w)({role_pattern})(?!\w)",
            line,
            re.I
        )

        if re.search(
            r"\b(developed|designed|implemented|created|"
            r"built|managed|worked|responsible|maintained|"
            r"analyzed|trained|deployed|tested|led|"
            r"assisted|contributed|integrated)\b",
            line,
            re.I
        ):
            responsibilities.append(line)

        if re.search(
            r"\b(inc|ltd|limited|llp|pvt|private|"
            r"technologies|technology|solutions|systems|"
            r"corporation|corp|company)\b",
            line,
            re.I
        ):
            if len(line) <= 120:
                companies.append(line)

    roles = list(
        dict.fromkeys(
            x.lower()
            for x in roles
        )
    )

    if len(roles) > 1:
        roles = [
            x for x in roles
            if x not in [
                "engineer",
                "developer",
                "intern"
            ]
        ]

    return {
        "company": ", ".join(
            dict.fromkeys(companies[:3])
        ) or "Not available",

        "url": ", ".join(
            dict.fromkeys(urls)
        ) or "Not available",

        "responsibilities": " ".join(
            dict.fromkeys(
                responsibilities[:5]
            )
        ) or "Not available",

        "role": ", ".join(
            roles[:3]
        ) or "Not available"
    }


def extract_position(text):

    summary = get_section(
        text,
        SECTIONS["summary"]
    )

    found = find_matches(
        summary,
        POSITIONS
    )

    if not found:
        found = find_matches(
            text,
            POSITIONS
        )

    found = [
        x for x in found
        if x.lower() not in [
            "engineer",
            "developer",
            "intern"
        ]
    ]

    return ", ".join(found[:3]) or "Not available"


def extract_address(text):

    for line in text.splitlines():

        line = clean(line)

        match = re.search(
            r"^(?:address|current address|"
            r"permanent address|residence)"
            r"\s*[:\-]?\s*(.+)",
            line,
            re.I
        )

        if match:
            return clean(match.group(1))

    return "Not available"


def extract_location(text):

    patterns = [
        r"^(?:location|current location|preferred location|"
        r"city|residing in|based in|place)\s*[:\-]\s*(.+)$",

        r"^(?:address|current address|permanent address|"
        r"residential address)\s*[:\-]\s*(.+)$"
    ]

    for line in text.splitlines():

        line = clean(line)

        if not line:
            continue

        for pattern in patterns:

            match = re.search(
                pattern,
                line,
                re.I
            )

            if match:

                value = clean(match.group(1))

                if 2 <= len(value) <= 150:
                    return value

    return "Not available"

def extract_certification(text):

    part = get_section(
        text,
        SECTIONS["certification"]
    )

    if not part:
        return "Not available"

    return ", ".join(
        clean(x)
        for x in part.splitlines()
        if clean(x)
    ) or "Not available"


def extract_proficiency(text):

    levels = [
        "Beginner",
        "Intermediate",
        "Advanced",
        "Expert",
        "Proficient"
    ]

    return ", ".join(
        find_matches(text, levels)
    ) or "Not available"


def profile_candidate(db, candidate):

    text = candidate.resume_text or ""

    if not text.strip():
        return None

    education = extract_education(text)
    experience = extract_experience(text)

    skills = find_matches(
        text,
        SKILLS
    )

    languages = find_matches(
        text,
        LANGUAGES
    )

    positions = extract_position(text)

    summary = get_section(
        text,
        SECTIONS["summary"]
    )

    objective = (
        " ".join(
            clean(x)
            for x in summary.splitlines()[:3]
        )
        if summary
        else "Not available"
    )

    candidate.address = extract_address(text)
    candidate.career_objective = objective

    candidate.educational_institution_name = \
        education["institution"]

    candidate.degree_names = \
        education["degree"]

    candidate.passing_years = \
        education["year"]

    candidate.educational_results = \
        education["result"]

    candidate.major_field_of_studies = \
        education["field"]

    candidate.professional_company_names = \
        experience["company"]

    candidate.company_urls = \
        experience["url"]

    candidate.related_skils_in_job = (
        ", ".join(skills)
        if skills
        else "Not available"
    )

    candidate.positions = positions

    candidate.locations = extract_location(text)

    candidate.responsibilities = \
        experience["responsibilities"]

    candidate.role_positions = \
        experience["role"]

    candidate.languages = (
        ", ".join(languages)
        if languages
        else "Not available"
    )

    candidate.proficiency_levels = \
        extract_proficiency(text)

    candidate.certification_providers = \
        extract_certification(text)

    db.query(CandidateSkill).filter(
        CandidateSkill.candidate_id ==
        candidate.candidate_id
    ).delete(
        synchronize_session=False
    )

    for skill in skills:
        db.add(
            CandidateSkill(
                candidate_id=candidate.candidate_id,
                skill_name=skill
            )
        )

    return {
        "candidate_id": candidate.candidate_id,
        "resume_file_name": candidate.resume_file_name,
        "resume_file_path": candidate.resume_file_path,
        "resume_text": candidate.resume_text,
        "address": candidate.address,
        "career_objective": candidate.career_objective,
        "educational_institution_name":
            candidate.educational_institution_name,
        "degree_names":
            candidate.degree_names,
        "passing_years":
            candidate.passing_years,
        "educational_results":
            candidate.educational_results,
        "major_field_of_studies":
            candidate.major_field_of_studies,
        "professional_company_names":
            candidate.professional_company_names,
        "company_urls":
            candidate.company_urls,
        "related_skils_in_job":
            candidate.related_skils_in_job,
        "positions":
            candidate.positions,
        "locations":
            candidate.locations,
        "responsibilities":
            candidate.responsibilities,
        "role_positions":
            candidate.role_positions,
        "languages":
            candidate.languages,
        "proficiency_levels":
            candidate.proficiency_levels,
        "certification_providers":
            candidate.certification_providers
    }


def main():

    db = SessionLocal()

    try:

        candidates = (
            db.query(Candidate)
            .filter(
                Candidate.resume_file_name.isnot(None),
                Candidate.resume_file_name != ""
            )
            .order_by(
                Candidate.candidate_id
            )
            .all()
        )

        print("Database connected!")
        print("PDF candidates:", len(candidates))

        for candidate in candidates:

            profile = profile_candidate(
                db,
                candidate
            )

            if not profile:
                continue

            print("\n" + "=" * 60)
            print("Candidate ID:", profile["candidate_id"])
            print("Institution:",
                  profile["educational_institution_name"])
            print("Degree:",
                  profile["degree_names"])
            print("Field:",
                  profile["major_field_of_studies"])
            print("Result:",
                  profile["educational_results"])
            print("Passing Year:",
                  profile["passing_years"])
            print("Company:",
                  profile["professional_company_names"])
            print("Company URL:",
                  profile["company_urls"])
            print("Position:",
                  profile["positions"])
            print("Role:",
                  profile["role_positions"])
            print("Skills:",
                  profile["related_skils_in_job"])
            print("Languages:",
                  profile["languages"])
            print("=" * 60)

        db.commit()

        print("\nProfiling completed successfully.")

    except Exception as e:

        db.rollback()
        print("ERROR:", e)

    finally:
        db.close()


if __name__ == "__main__":
    main()