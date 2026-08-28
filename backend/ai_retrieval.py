from database import SessionLocal
from models import Candidate, Job, CandidateSkill, JobSkill, JobApplication


def get_candidate_job_data(candidate_id, job_id):

    db = SessionLocal()

    try:
        candidate = db.query(Candidate).filter(
            Candidate.candidate_id == candidate_id
        ).first()

        job = db.query(Job).filter(
            Job.job_id == job_id
        ).first()

        candidate_skills = db.query(CandidateSkill).filter(
            CandidateSkill.candidate_id == candidate_id
        ).all()

        job_skills = db.query(JobSkill).filter(
            JobSkill.job_id == job_id
        ).all()

        application = db.query(JobApplication).filter(
            JobApplication.candidate_id == candidate_id,
            JobApplication.job_id == job_id
        ).first()

        candidate_set = {
            s.skill_name.lower().strip()
            for s in candidate_skills
            if s.skill_name
        }

        job_set = {
            s.skill_name.lower().strip()
            for s in job_skills
            if s.skill_name
        }

        matched_skills = sorted(candidate_set & job_set)
        missing_skills = sorted(job_set - candidate_set)

        skill_match_percentage = (
            len(matched_skills) / len(job_set) * 100
            if job_set else 0
        )

        ml_match_score = (
            float(application.match_score or 0)
            if application else 0
        )

        return {
            "candidate": candidate,
            "candidate_skills": candidate_skills,
            "job": job,
            "job_skills": job_skills,
            "job_application": application,
            "ml_match_score": ml_match_score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_match_percentage": skill_match_percentage
        }

    finally:
        db.close()


if __name__ == "__main__":

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

                print("\nCandidate:", data["candidate"].candidate_id)

                print(
                    "Candidate Skills:",
                    [s.skill_name for s in data["candidate_skills"]]
                )

                print(
                    "Job:",
                    data["job"].job_position_name
                )

                print(
                    "Job Skills:",
                    [s.skill_name for s in data["job_skills"]]
                )

                print(
                    "ML Match Score:",
                    f"{data['ml_match_score'] * 100:.2f}%"
                )

                print(
                    "Skill Match:",
                    f"{data['skill_match_percentage']:.2f}%"
                )

                print(
                    "Matched Skills:",
                    data["matched_skills"]
                )

                print(
                    "Missing Skills:",
                    data["missing_skills"]
                )

                displayed = True

            if index % 1000 == 0:
                print(f"{index}/{len(applications)}")

    finally:
        db.close()