import ast
from ai_retrieval import get_candidate_job_data


def clean_value(value):

    if value is None:
        return "Not provided"

    if isinstance(value, list):
        return ", ".join(str(x).strip() for x in value if x)

    if isinstance(value, str):

        try:
            value = ast.literal_eval(value)

            if isinstance(value, list):
                return ", ".join(
                    str(x).strip()
                    for x in value
                    if x
                )

        except (ValueError, SyntaxError):
            pass

    return str(value).strip()


def build_rag_context(data):

    candidate = data["candidate"]
    job = data["job"]

    candidate_skills = ", ".join(
        s.skill_name.strip()
        for s in data["candidate_skills"]
        if s.skill_name
    )

    job_skills = ", ".join(
        s.skill_name.strip()
        for s in data["job_skills"]
        if s.skill_name
    )

    return f"""
Candidate:
ID: {candidate.candidate_id}
Career Objective: {clean_value(candidate.career_objective)}
Degree: {clean_value(candidate.degree_names)}
Major: {clean_value(candidate.major_field_of_studies)}
Experience: {clean_value(candidate.professional_company_names)}
Position: {clean_value(candidate.positions)}

Candidate Skills:
{candidate_skills or "None"}

Job:
ID: {job.job_id}
Position: {clean_value(job.job_position_name)}
Education: {clean_value(job.educationaL_requirements)}
Experience: {clean_value(job.experiencere_requirement)}
Responsibilities: {clean_value(job.responsibilities)}

Required Skills:
{job_skills or "None"}

ML Match Score:
{data["ml_match_score"] * 100:.2f}%

Skill Match:
{data["skill_match_percentage"]:.2f}%

Matched Skills:
{", ".join(data["matched_skills"]) or "None"}

Missing Skills:
{", ".join(data["missing_skills"]) or "None"}
""".strip()


if __name__ == "__main__":

    db_data = None

    from database import SessionLocal
    from models import JobApplication

    db = SessionLocal()

    try:
        applications = (
            db.query(JobApplication)
            .order_by(JobApplication.application_id)
            .all()
        )

        print("Database connected!")
        print("Total Applications:", len(applications))

        displayed = False

        for index, application in enumerate(applications, 1):

            data = get_candidate_job_data(
                application.candidate_id,
                application.job_id
            )

            if not data:
                continue

            if not displayed:

                print("\nRAG Context:\n")
                print(build_rag_context(data))

                displayed = True

            if index % 1000 == 0:
                print(f"{index}/{len(applications)}")

    finally:
        db.close()