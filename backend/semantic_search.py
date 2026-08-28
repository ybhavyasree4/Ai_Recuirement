from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from database import SessionLocal
from models import Candidate, Job, CandidateSkill, JobSkill

db = SessionLocal()

try:
    candidates = db.query(Candidate).all()
    jobs = db.query(Job).all()

    cskills = {}
    for s in db.query(CandidateSkill).all():
        cskills.setdefault(s.candidate_id, []).append(s.skill_name)

    jskills = {}
    for s in db.query(JobSkill).all():
        jskills.setdefault(s.job_id, []).append(s.skill_name)

    candidate_texts = [
        " ".join([
            c.career_objective or "",
            c.degree_names or "",
            c.major_field_of_studies or "",
            c.professional_company_names or "",
            c.positions or "",
            c.responsibilities or "",
            " ".join(cskills.get(c.candidate_id, []))
        ])
        for c in candidates
    ]

    job_texts = [
        " ".join([
            j.job_position_name or "",
            j.educationaL_requirements or "",
            j.experiencere_requirement or "",
            j.responsibilities or "",
            " ".join(jskills.get(j.job_id, []))
        ])
        for j in jobs
    ]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000
    )

    vectors = vectorizer.fit_transform(
        job_texts + candidate_texts
    )

    job_vectors = vectors[:len(jobs)]
    candidate_vectors = vectors[len(jobs):]

    print(f"Candidates: {len(candidates)} | Jobs: {len(jobs)}")

    for i, job in enumerate(jobs):
        scores = cosine_similarity(
            job_vectors[i],
            candidate_vectors
        )[0]

        top = scores.argsort()[-3:][::-1]

        print(f"\nJob {job.job_id} - {job.job_position_name}")

        for rank, index in enumerate(top, 1):
            print(
                f"{rank}. Candidate "
                f"{candidates[index].candidate_id} - "
                f"{scores[index] * 100:.2f}%"
            )

    print("\nSemantic search completed.")

finally:
    db.close()