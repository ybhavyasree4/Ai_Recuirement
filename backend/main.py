from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import json

from database import SessionLocal
from models import Candidate, Job, JobApplication

from upload_resume import process_single_resume
from candidate_profiling import profile_candidate
from candidate_matching import match_candidate
from skill_gap import analyze_candidate_skill_gaps
from ranking import generate_rankings
from ai_recommendation import generate_ai_recommendations


app = FastAPI(
    title="AI Recruitment Platform"
)


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():

    return {
        "message":
            "AI Recruitment Platform API is running"
    }


@app.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db)
):

    return db.query(Candidate).all()


@app.get("/candidates/{candidate_id}")
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    candidate = db.query(
        Candidate
    ).filter(
        Candidate.candidate_id == candidate_id
    ).first()

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    return candidate


@app.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db)
):

    return db.query(Job).all()


@app.get("/jobs/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):

    job = db.query(
        Job
    ).filter(
        Job.job_id == job_id
    ).first()

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job


@app.get("/applications")
def get_applications(
    db: Session = Depends(get_db)
):

    return db.query(JobApplication).all()


@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    folder = Path("temp_resumes")
    folder.mkdir(exist_ok=True)

    temp_file = folder / file.filename

    try:

        with open(temp_file, "wb") as f:
            f.write(await file.read())

        upload_result = process_single_resume(
            temp_file
        )

        candidate_id = upload_result[
            "candidate_id"
        ]

        db = SessionLocal()

        try:

            candidate = db.query(
                Candidate
            ).filter(
                Candidate.candidate_id ==
                candidate_id
            ).first()

            if not candidate:

                raise Exception(
                    "Candidate not found"
                )

            profile = profile_candidate(
                db,
                candidate
            )

            db.commit()

        finally:

            db.close()

        return {
            "message":
                "Resume uploaded and profiled successfully",
            "candidate":
                upload_result,
            "profile":
                profile
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if temp_file.exists():
            temp_file.unlink()


@app.post("/match/{candidate_id}")
def match_candidate_api(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    candidate = db.query(
        Candidate
    ).filter(
        Candidate.candidate_id ==
        candidate_id
    ).first()

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    try:

        result = match_candidate(
            db,
            candidate_id
        )

        return {
            "candidate_id":
                candidate_id,
            "matches":
                result
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/skill-gap/{candidate_id}")
def skill_gap_api(
    candidate_id: int,
    db: Session = Depends(get_db)
):

    candidate = db.query(
        Candidate
    ).filter(
        Candidate.candidate_id ==
        candidate_id
    ).first()

    if not candidate:

        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )

    try:

        result = analyze_candidate_skill_gaps(
            db,
            candidate_id
        )

        return {
            "candidate_id":
                candidate_id,
            "skill_gaps":
                result
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/ranking")
def ranking_api(
    db: Session = Depends(get_db)
):

    try:

        results = generate_rankings(db)

        response = []

        for job_id, candidates in results.items():

            for result in candidates:

                application = result[
                    "application"
                ]

                response.append({
                    "job_id":
                        job_id,
                    "candidate_id":
                        application.candidate_id,
                    "ranking":
                        application.ranking,
                    "match_score":
                        round(
                            float(
                                application.match_score or 0
                            ) * 100,
                            2
                        ),
                    "skill_match_percentage":
                        round(
                            float(
                                application.skill_match_percentage or 0
                            ),
                            2
                        ),
                    "final_score":
                        result["final_score"]
                })

        return {
            "message":
                "Ranking completed successfully",
            "rankings":
                response
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/ranking/{job_id}")
def get_job_ranking(
    job_id: int,
    db: Session = Depends(get_db)
):

    applications = (
        db.query(JobApplication)
        .filter(
            JobApplication.job_id == job_id
        )
        .all()
    )

    if not applications:

        raise HTTPException(
            status_code=404,
            detail="No applications found"
        )

    results = []

    for application in applications:

        match_score = float(
            application.match_score or 0
        ) * 100

        skill_score = float(
            application.skill_match_percentage or 0
        )

        final_score = (
            match_score * 0.5
            + skill_score * 0.5
        )

        results.append({
            "application_id":
                application.application_id,
            "candidate_id":
                application.candidate_id,
            "job_id":
                application.job_id,
            "match_score":
                round(match_score, 2),
            "skill_match_percentage":
                round(skill_score, 2),
            "final_score":
                round(final_score, 2),
            "matched_skills":
                application.matched_skills,
            "missing_skills":
                application.missing_skills
        })

    results.sort(
        key=lambda x: x["final_score"],
        reverse=True
    )

    for rank, result in enumerate(
        results,
        start=1
    ):
        result["ranking"] = rank

    return {
        "job_id":
            job_id,
        "rankings":
            results
    }


@app.post("/ai-recommendations")
def ai_recommendations(
    db: Session = Depends(get_db)
):

    try:

        return generate_ai_recommendations(db)

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/ai-recommendations/{job_id}")
def get_ai_recommendations(
    job_id: int,
    db: Session = Depends(get_db)
):

    applications = (
        db.query(JobApplication)
        .filter(
            JobApplication.job_id == job_id
        )
        .order_by(
            JobApplication.ranking.asc()
        )
        .limit(5)
        .all()
    )

    if not applications:

        raise HTTPException(
            status_code=404,
            detail="No applications found"
        )

    results = []

    for application in applications:

        if not application.recommendation:
            continue

        try:

            recommendation = json.loads(
                application.recommendation
            )

        except Exception:

            recommendation = {
                "recommendation":
                    application.recommendation
            }

        results.append({
            "application_id":
                application.application_id,
            "candidate_id":
                application.candidate_id,
            "job_id":
                application.job_id,
            "ranking":
                application.ranking,
            "recommendation":
                recommendation
        })

    return {
        "job_id":
            job_id,
        "top_5_candidates":
            results
    }