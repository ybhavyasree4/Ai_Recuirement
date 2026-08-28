from database import SessionLocal
from models import JobApplication, CandidateSkill, JobSkill
import re

db = SessionLocal()

ALIASES = {
    "react": "reactjs",
    "react js": "reactjs",
    "react.js": "reactjs",
    "next js": "nextjs",
    "next.js": "nextjs",
    "node": "nodejs",
    "node.js": "nodejs",
    "ml": "machine learning",
    "nlp": "natural language processing",
    "postgres": "postgresql",
    "sklearn": "scikit learn",
    "scikit-learn": "scikit learn",
    "js": "javascript",
    "aws cloud": "aws",
    "k8s": "kubernetes",
    "dba": "database administrator",
    "seo": "search engine optimization",
    "github": "git"
}


def normalize(skill):
    skill = str(skill or "").lower().strip()
    skill = re.sub(r"[•●▪]", " ", skill)
    skill = skill.replace("&", " and ")
    skill = re.sub(r"[^a-z0-9+#./-]+", " ", skill)
    skill = re.sub(r"\s+", " ", skill)
    return skill.strip()


def canonical(skill):
    skill = normalize(skill)
    return ALIASES.get(skill, skill)


def split_skills(skill):
    skill = normalize(skill)

    if not skill:
        return []

    skill = skill.replace(
        "ieltsinternet",
        "ielts internet"
    )

    return [
        x.strip()
        for x in re.split(r"[,;|]+", skill)
        if x.strip()
    ]


def skill_matches(candidate, required):
    candidate = canonical(candidate)
    required = canonical(required)

    if not candidate or not required:
        return False

    if candidate == required:
        return True

    if candidate in required or required in candidate:
        return True

    candidate_words = set(candidate.split())
    required_words = set(required.split())

    common = candidate_words & required_words

    if required_words and len(common) / len(required_words) >= 0.6:
        return True

    return False


def get_skills(db, model, id_column, id_value):

    rows = (
        db.query(model)
        .filter(id_column == id_value)
        .all()
    )

    skills = []

    for row in rows:
        for skill in split_skills(row.skill_name):
            if skill not in skills:
                skills.append(skill)

    return skills


def analyze_candidate_skill_gaps(db, candidate_id):

    applications = (
        db.query(JobApplication)
        .filter(
            JobApplication.candidate_id == candidate_id
        )
        .all()
    )

    results = []

    candidate_skills = get_skills(
        db,
        CandidateSkill,
        CandidateSkill.candidate_id,
        candidate_id
    )

    for app in applications:

        job_skills = get_skills(
            db,
            JobSkill,
            JobSkill.job_id,
            app.job_id
        )

        matched = []
        missing = []

        for required in job_skills:

            found = False

            for candidate in candidate_skills:

                if skill_matches(candidate, required):
                    found = True

                    if candidate not in matched:
                        matched.append(candidate)

                    break

            if not found:
                missing.append(required)

        if job_skills:
            percentage = round(
                len(matched) / len(job_skills) * 100,
                2
            )
        else:
            percentage = 0

        app.skill_match_percentage = percentage
        app.matched_skills = "\n".join(matched)
        app.missing_skills = "\n".join(missing)

        results.append({
            "candidate_id": candidate_id,
            "job_id": app.job_id,
            "semantic_score": round(
                float(app.match_score or 0) * 100,
                2
            ),
            "matched_skills": matched,
            "missing_skills": missing,
            "skill_match_percentage": percentage
        })

    db.commit()

    return sorted(
        results,
        key=lambda x: x["semantic_score"],
        reverse=True
    )


if __name__ == "__main__":

    try:
        candidate_id = 348

        results = analyze_candidate_skill_gaps(
            db,
            candidate_id
        )

        for result in results:

            print(
                f"\nJob {result['job_id']}"
            )

            print(
                f"Semantic Score: "
                f"{result['semantic_score']}%"
            )

            print(
                f"Skill Match: "
                f"{result['skill_match_percentage']}%"
            )

            print(
                "Matched:",
                ", ".join(
                    result["matched_skills"]
                ) or "None"
            )

            print(
                "Missing:",
                ", ".join(
                    result["missing_skills"]
                ) or "None"
            )

    except Exception as e:
        db.rollback()
        print("ERROR:", e)

    finally:
        db.close()