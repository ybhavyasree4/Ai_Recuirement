from database import SessionLocal
from models import JobApplication, Job, Candidate
import ast


def clean(value):
    if not value:
        return "Not available"

    try:
        data = ast.literal_eval(str(value))
        if isinstance(data, (list, tuple, set)):
            value = ", ".join(map(str, data))
    except:
        pass

    return " ".join(
        str(value).replace("\n", " ").split()
    ).strip("[](){}'\" ") or "Not available"


def get_education(db, candidate_id):
    candidate = db.query(Candidate).filter(
        Candidate.candidate_id == candidate_id
    ).first()

    return clean(candidate.degree_names) if candidate else "Not available"


def calculate_final_score(app):
    match_score = float(app.match_score or 0) * 100
    skill_score = float(app.skill_match_percentage or 0)

    return round(
        (match_score * 0.5) +
        (skill_score * 0.5),
        2
    )


def generate_rankings(db):

    jobs = db.query(Job).order_by(
        Job.job_id
    ).all()

    all_results = {}

    for job in jobs:

        applications = db.query(
            JobApplication
        ).filter(
            JobApplication.job_id == job.job_id
        ).all()

        results = []

        for app in applications:

            score = calculate_final_score(app)

            results.append({
                "application": app,
                "final_score": score
            })

        results.sort(
            key=lambda x: x["final_score"],
            reverse=True
        )

        for rank, result in enumerate(
            results,
            start=1
        ):
            result["application"].ranking = rank

        all_results[job.job_id] = results

    db.commit()

    return all_results


if __name__ == "__main__":

    db = SessionLocal()

    try:

        results = generate_rankings(db)

        print("RANKING COMPLETED")

        for job_id, candidates in results.items():

            print(f"\nJob ID: {job_id}")

            for result in candidates[:3]:

                app = result["application"]

                print(
                    f"Rank: {app.ranking} | "
                    f"Candidate: {app.candidate_id} | "
                    f"Match: {float(app.match_score or 0) * 100:.2f}% | "
                    f"Skill: {float(app.skill_match_percentage or 0):.2f}% | "
                    f"Final: {result['final_score']:.2f}%"
                )

    except Exception as e:

        db.rollback()
        print("ERROR:", e)

    finally:
        db.close()