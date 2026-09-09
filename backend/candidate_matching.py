from backend.semantic_search import get_similarity

from backend.models import (
    Candidate,
    Job,
    CandidateSkill,
    JobSkill,
    JobApplication
)


def text(*values):
    return " ".join(
        str(v or "").strip()
        for v in values
    )


def match_candidate(db, candidate_id):

    candidate = db.query(Candidate).filter(
        Candidate.candidate_id == candidate_id
    ).first()

    if not candidate:
        return None

    jobs = db.query(Job).order_by(
        Job.job_id
    ).all()

    if not jobs:
        return []

    candidate_skills = [
        s.skill_name
        for s in db.query(CandidateSkill).filter(
            CandidateSkill.candidate_id == candidate_id
        ).all()
        if s.skill_name
    ]

    job_skills = {}

    for skill in db.query(JobSkill).all():

        if skill.skill_name:

            job_skills.setdefault(
                skill.job_id,
                []
            ).append(
                skill.skill_name
            )

    candidate_text = text(
        candidate.career_objective,
        candidate.degree_names,
        candidate.major_field_of_studies,
        candidate.professional_company_names,
        candidate.positions,
        candidate.responsibilities,
        candidate.related_skils_in_job,
        candidate.languages,
        candidate.proficiency_levels,
        *candidate_skills
    )

    results = []

    for job in jobs:

        job_text = text(
            job.job_position_name,
            job.educationaL_requirements,
            job.experiencere_requirement,
            job.responsibilities,
            *job_skills.get(
                job.job_id,
                []
            )
        )

        score = get_similarity(
            candidate_text,
            job_text
        )

        application = db.query(
            JobApplication
        ).filter(
            JobApplication.candidate_id == candidate_id,
            JobApplication.job_id == job.job_id
        ).first()

        if application:

            application.match_score = score

        else:

            application = JobApplication(
                candidate_id=candidate_id,
                job_id=job.job_id,
                match_score=score,
                skill_match_percentage=0,
                matched_skills="",
                missing_skills="",
                ranking=0,
                recommendation="Pending Analysis",
                application_status="Applied"
            )

            db.add(application)

        results.append({
            "job_id": job.job_id,
            "job_title": job.job_position_name,
            "match_score": round(
                score * 100,
                2
            )
        })

    db.commit()

    return sorted(
        results,
        key=lambda x: x["match_score"],
        reverse=True
    )