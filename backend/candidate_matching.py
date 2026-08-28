import joblib
import numpy as np

from models import Candidate, Job, CandidateSkill, JobSkill, JobApplication

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")


def text(*values):
    return " ".join(str(v or "").strip() for v in values)


def match_candidate(db, candidate_id):

    candidate = db.query(Candidate).filter(
        Candidate.candidate_id == candidate_id
    ).first()

    if not candidate:
        return None

    jobs = db.query(Job).order_by(Job.job_id).all()

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

    for s in db.query(JobSkill).all():
        if s.skill_name:
            job_skills.setdefault(s.job_id, []).append(s.skill_name)

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

    combined_texts = []
    job_ids = []

    for job in jobs:
        job_text = text(
            job.job_position_name,
            job.educationaL_requirements,
            job.experiencere_requirement,
            job.responsibilities,
            *job_skills.get(job.job_id, [])
        )

        combined_texts.append(
            job_text + " " + candidate_text
        )

        job_ids.append(job.job_id)

    vectors = vectorizer.transform(combined_texts)

    scores = np.clip(
        model.predict(vectors),
        0,
        1
    )

    results = []

    for job_id, score in zip(job_ids, scores):

        application = db.query(JobApplication).filter(
            JobApplication.candidate_id == candidate_id,
            JobApplication.job_id == job_id
        ).first()

        if application:
            application.match_score = float(score)
        else:
            application = JobApplication(
                candidate_id=candidate_id,
                job_id=job_id,
                match_score=float(score),
                skill_match_percentage=0,
                matched_skills="",
                missing_skills="",
                ranking=0,
                recommendation="Pending Analysis",
                application_status="Applied"
            )
            db.add(application)

        job = db.query(Job).filter(
            Job.job_id == job_id
        ).first()

        results.append({
            "job_id": job_id,
            "job_title": job.job_position_name,
            "match_score": round(float(score) * 100, 2)
        })

    db.commit()

    return sorted(
        results,
        key=lambda x: x["match_score"],
        reverse=True
    )