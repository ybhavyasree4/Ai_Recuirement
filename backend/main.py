from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pathlib import Path

import json
import bcrypt
import random
import os

from dotenv import load_dotenv

from google.oauth2 import id_token
from google.auth.transport import requests

from database import SessionLocal
from models import User, Candidate, Job, JobApplication

from schemas import (
    SignupRequest,
    LoginRequest,
    VerifyEmailRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

from email_service import send_email

from upload_resume import process_single_resume
from candidate_profiling import profile_candidate
from candidate_matching import match_candidate
from skill_gap import analyze_candidate_skill_gaps
from ranking import generate_rankings
from ai_recommendation import generate_ai_recommendations


# ============================================================
# LOAD .ENV FROM OUTSIDE BACKEND
# ============================================================

# main.py is inside:
# AI_Recuirement/backend/main.py
#
# .env is inside:
# AI_Recuirement/.env

BASE_DIR = Path(__file__).resolve().parent.parent

ENV_FILE = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="AI Recruitment Platform"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# DATABASE
# ============================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "AI Recruitment Platform API is running"
    }


# ============================================================
# TEST EMAIL
# ============================================================

@app.get("/test-email")
def test_email():

    send_email(
        "YOUR_EMAIL@gmail.com",
        "AI Recruitment Test",
        "SMTP email is working successfully!"
    )

    return {
        "message": "Test email sent successfully"
    }


# ============================================================
# SIGNUP
# ============================================================

@app.post("/signup")
def signup(
    data: SignupRequest,
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    password = bcrypt.hashpw(
        data.password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    otp = str(
        random.randint(100000, 999999)
    )

    user = User(
        name=data.name,
        email=data.email,
        password=password,
        google_id=None,
        is_verified=0,
        verification_otp=otp,
        reset_otp=None
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    send_email(
        user.email,
        "AI Recruitment - Email Verification",
        f"""
Hello {user.name},

Thank you for signing up for the AI Recruitment Platform.

Your email verification OTP is:

{otp}

Enter this OTP in the verification page to verify your email.

Regards,
AI Recruitment Platform
"""
    )

    return {
        "message": "Signup successful. Verification OTP sent to your email.",
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email
    }


# ============================================================
# VERIFY EMAIL
# ============================================================

@app.post("/verify-email")
def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.is_verified == 1:

        return {
            "message": "Email already verified"
        }

    if user.verification_otp != data.otp:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    user.is_verified = 1
    user.verification_otp = None

    db.commit()

    return {
        "message": "Email verified successfully. You can now login."
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.is_verified != 1:

        raise HTTPException(
            status_code=403,
            detail="Please verify your email before login"
        )

    if not user.password:

        raise HTTPException(
            status_code=401,
            detail="This account uses Google login. Please continue with Google."
        )

    try:

        valid = bcrypt.checkpw(
            data.password.encode("utf-8"),
            user.password.encode("utf-8")
        )

    except Exception:

        valid = False

    if not valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email
    }


# ============================================================
# GOOGLE LOGIN / SIGNUP
# ============================================================

@app.post("/auth/google")
def google_login(
    data: dict,
    db: Session = Depends(get_db)
):

    credential = data.get("credential")

    if not credential:

        raise HTTPException(
            status_code=400,
            detail="Google credential is required"
        )

    # Read Google Client ID from root .env
    google_client_id = os.getenv(
        "GOOGLE_CLIENT_ID"
    )

    if not google_client_id:

        raise HTTPException(
            status_code=500,
            detail="Google Client ID is not configured"
        )

    try:

        # ====================================================
        # VERIFY GOOGLE ID TOKEN
        # ====================================================

        google_data = id_token.verify_oauth2_token(
            credential,
            requests.Request(),
            google_client_id
        )

        # ====================================================
        # GET GOOGLE DATA
        # ====================================================

        google_id = google_data.get("sub")

        email = google_data.get("email")

        name = google_data.get("name")

        email_verified = google_data.get(
            "email_verified",
            False
        )

        # ====================================================
        # VALIDATE GOOGLE DATA
        # ====================================================

        if not google_id:

            raise HTTPException(
                status_code=400,
                detail="Google account ID not found"
            )

        if not email:

            raise HTTPException(
                status_code=400,
                detail="Google email not found"
            )

        if not email_verified:

            raise HTTPException(
                status_code=400,
                detail="Google email is not verified"
            )

        # ====================================================
        # FIND USER BY GOOGLE ID
        # ====================================================

        user = db.query(User).filter(
            User.google_id == google_id
        ).first()

        # ====================================================
        # IF NOT FOUND, FIND BY EMAIL
        # ====================================================

        if not user:

            user = db.query(User).filter(
                User.email == email
            ).first()

        # ====================================================
        # EXISTING USER
        # ====================================================

        if user:

            user.google_id = google_id

            user.is_verified = 1

            user.verification_otp = None

            if not user.name:

                user.name = name or "Google User"

            db.commit()

            db.refresh(user)

        # ====================================================
        # NEW GOOGLE USER
        # ====================================================

        else:

            user = User(
                name=name or "Google User",
                email=email,
                password=None,
                google_id=google_id,
                is_verified=1,
                verification_otp=None,
                reset_otp=None
            )

            db.add(user)

            db.commit()

            db.refresh(user)

        # ====================================================
        # SUCCESS
        # ====================================================

        return {
            "message": "Google login successful",
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email
        }

    except ValueError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential"
        )

    except HTTPException:

        raise

    except Exception as e:

        db.rollback()

        print(
            f"GOOGLE LOGIN ERROR: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Google authentication failed"
        )


# ============================================================
# FORGOT PASSWORD
# ============================================================

@app.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="Email not registered"
        )

    if not user.password:

        raise HTTPException(
            status_code=400,
            detail="This account uses Google login. Please continue with Google."
        )

    otp = str(
        random.randint(100000, 999999)
    )

    user.reset_otp = otp

    db.commit()

    send_email(
        user.email,
        "AI Recruitment - Password Reset OTP",
        f"""
Hello {user.name},

You requested to reset your password.

Your password reset OTP is:

{otp}

Enter this OTP to reset your password.

If you did not request this, please ignore this email.

Regards,
AI Recruitment Platform
"""
    )

    return {
        "message": "Password reset OTP sent to your email."
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@app.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == data.email
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.reset_otp != data.otp:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )

    password = bcrypt.hashpw(
        data.new_password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    user.password = password

    user.reset_otp = None

    db.commit()

    return {
        "message": "Password reset successfully. You can now login."
    }


# ============================================================
# GET ALL CANDIDATES
# ============================================================

@app.get("/candidates")
def get_candidates(
    db: Session = Depends(get_db)
):

    return db.query(
        Candidate
    ).order_by(
        Candidate.candidate_id.asc()
    ).all()


# ============================================================
# GET SINGLE CANDIDATE
# ============================================================

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


# ============================================================
# CANDIDATE PROFILE
# ============================================================

@app.get("/candidate-profile/{candidate_id}")
def get_candidate_profile(
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

    try:

        profile = profile_candidate(
            db,
            candidate
        )

        if profile is None:

            return {
                "candidate_id": candidate.candidate_id,
                "resume_file_name": candidate.resume_file_name,
                "resume_file_path": candidate.resume_file_path,
                "resume_text": candidate.resume_text or "",
                "address": candidate.address or "Not available",
                "career_objective": candidate.career_objective or "Not available",
                "educational_institution_name": candidate.educational_institution_name or "Not available",
                "degree_names": candidate.degree_names or "Not available",
                "passing_years": candidate.passing_years or "Not available",
                "educational_results": candidate.educational_results or "Not available",
                "major_field_of_studies": candidate.major_field_of_studies or "Not available",
                "professional_company_names": candidate.professional_company_names or "Not available",
                "company_urls": candidate.company_urls or "Not available",
                "related_skils_in_job": candidate.related_skils_in_job or "Not available",
                "positions": candidate.positions or "Not available",
                "locations": candidate.locations or "Not available",
                "responsibilities": candidate.responsibilities or "Not available",
                "role_positions": candidate.role_positions or "Not available",
                "languages": candidate.languages or "Not available",
                "proficiency_levels": candidate.proficiency_levels or "Not available",
                "certification_providers": candidate.certification_providers or "Not available",
                "profiling_status": "Resume text is not available for this candidate."
            }

        db.commit()

        return profile

    except Exception as e:

        db.rollback()

        print(
            f"PROFILE ERROR for candidate {candidate_id}: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# GET ALL JOBS
# ============================================================

@app.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db)
):

    return db.query(
        Job
    ).order_by(
        Job.job_id.asc()
    ).all()


# ============================================================
# GET SINGLE JOB
# ============================================================

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


# ============================================================
# GET APPLICATIONS
# ============================================================

@app.get("/applications")
def get_applications(
    db: Session = Depends(get_db)
):

    return db.query(
        JobApplication
    ).order_by(
        JobApplication.application_id.asc()
    ).all()


# ============================================================
# DASHBOARD STATS
# ============================================================

@app.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db)
):

    candidates_count = db.query(
        func.count(Candidate.candidate_id)
    ).scalar()

    jobs_count = db.query(
        func.count(Job.job_id)
    ).scalar()

    applications_count = db.query(
        func.count(JobApplication.application_id)
    ).scalar()

    shortlisted_count = db.query(
        func.count(JobApplication.application_id)
    ).filter(
        func.lower(
            JobApplication.application_status
        ) == "shortlisted"
    ).scalar()

    return {
        "candidates": candidates_count or 0,
        "jobs": jobs_count or 0,
        "applications": applications_count or 0,
        "shortlisted": shortlisted_count or 0
    }


# ============================================================
# UPLOAD RESUME
# ============================================================

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

    folder.mkdir(
        exist_ok=True
    )

    temp_file = folder / file.filename

    try:

        with open(
            temp_file,
            "wb"
        ) as f:

            f.write(
                await file.read()
            )

        upload_result = process_single_resume(
            temp_file
        )

        candidate_id = upload_result["candidate_id"]

        if upload_result.get("already_exists"):

            return {
                "message": "Resume already existed",
                "already_exists": True,
                "candidate": {
                    "candidate_id": candidate_id,
                    "file_name": upload_result.get("file_name"),
                    "cloudinary_url": upload_result.get("cloudinary_url")
                }
            }

        return {
            "message": "Resume uploaded successfully",
            "already_exists": False,
            "candidate": {
                "candidate_id": candidate_id,
                "file_name": upload_result.get("file_name"),
                "cloudinary_url": upload_result.get("cloudinary_url")
            }
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        if temp_file.exists():

            temp_file.unlink()


# ============================================================
# MATCH CANDIDATE
# ============================================================

@app.post("/match/{candidate_id}")
def match_api(
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

    try:

        result = match_candidate(
            db,
            candidate_id
        )

        return {
            "candidate_id": candidate_id,
            "matches": result
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# SKILL GAP
# ============================================================

@app.get("/skill-gap/{candidate_id}")
def skill_gap_api(
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

    try:

        result = analyze_candidate_skill_gaps(
            db,
            candidate_id
        )

        return {
            "candidate_id": candidate_id,
            "skill_gaps": result
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# RANKING
# ============================================================

@app.post("/ranking")
def ranking_api(
    db: Session = Depends(get_db)
):

    try:

        results = generate_rankings(db)

        output = []

        for job_id, candidates in results.items():

            for item in candidates:

                application = item["application"]

                output.append({
                    "job_id": job_id,
                    "candidate_id": application.candidate_id,
                    "ranking": application.ranking,
                    "match_score": round(
                        float(application.match_score or 0) * 100,
                        2
                    ),
                    "skill_match_percentage": round(
                        float(application.skill_match_percentage or 0),
                        2
                    ),
                    "final_score": item["final_score"]
                })

        return {
            "message": "Ranking completed successfully",
            "rankings": output
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# GET RANKING BY JOB
# ============================================================

@app.get("/ranking/{job_id}")
def get_ranking(
    job_id: int,
    db: Session = Depends(get_db)
):

    applications = db.query(
        JobApplication
    ).filter(
        JobApplication.job_id == job_id
    ).order_by(
        JobApplication.match_score.desc(),
        JobApplication.skill_match_percentage.desc(),
        JobApplication.application_id.asc()
    ).all()

    if not applications:

        raise HTTPException(
            status_code=404,
            detail="No applications found"
        )

    results = []

    for rank, application in enumerate(
        applications,
        start=1
    ):

        match_score = float(
            application.match_score or 0
        ) * 100

        skill_score = float(
            application.skill_match_percentage or 0
        )

        final_score = (
            match_score * 0.5
            +
            skill_score * 0.5
        )

        results.append({
            "candidate_id": application.candidate_id,
            "job_id": application.job_id,
            "ranking": rank,
            "match_score": round(match_score, 2),
            "skill_match_percentage": round(skill_score, 2),
            "final_score": round(final_score, 2),
            "matched_skills": application.matched_skills,
            "missing_skills": application.missing_skills
        })

    return {
        "job_id": job_id,
        "rankings": results
    }


# ============================================================
# AI RECOMMENDATIONS
# ============================================================

@app.post("/ai-recommendations")
def ai_recommendations(
    db: Session = Depends(get_db)
):

    try:

        return generate_ai_recommendations(
            db
        )

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# GET AI RECOMMENDATIONS
# ============================================================

@app.get("/ai-recommendations/{job_id}")
def get_ai_recommendations(
    job_id: int,
    db: Session = Depends(get_db)
):

    applications = db.query(
        JobApplication
    ).filter(
        JobApplication.job_id == job_id
    ).order_by(
        JobApplication.match_score.desc(),
        JobApplication.skill_match_percentage.desc(),
        JobApplication.application_id.asc()
    ).limit(5).all()

    if not applications:

        raise HTTPException(
            status_code=404,
            detail="No applications found"
        )

    results = []

    for rank, application in enumerate(
        applications,
        start=1
    ):

        if rank <= 2:

            recommendation_type = "RECOMMENDED"

        elif rank == 3:

            recommendation_type = "CONSIDER"

        else:

            recommendation_type = "NOT RECOMMENDED"

        if application.recommendation:

            try:

                recommendation = json.loads(
                    application.recommendation
                )

            except Exception:

                recommendation = {}

        else:

            recommendation = {}

        recommendation["recommendation"] = recommendation_type

        if not recommendation.get("why"):

            recommendation["why"] = (
                "Candidate evaluated based on ranking "
                "and job requirements."
            )

        if recommendation_type != "NOT RECOMMENDED":

            recommendation.setdefault(
                "strengths",
                [
                    "Relevant skills or experience",
                    "Good alignment with job requirements"
                ]
            )

            recommendation.setdefault(
                "skill_gaps",
                []
            )

            recommendation.setdefault(
                "recruiter_action",
                "Review the candidate and consider an interview."
            )

        else:

            recommendation.pop(
                "strengths",
                None
            )

            recommendation.pop(
                "skill_gaps",
                None
            )

            recommendation.setdefault(
                "recruiter_action",
                "Review other candidates."
            )

        results.append({
            "application_id": application.application_id,
            "candidate_id": application.candidate_id,
            "job_id": application.job_id,
            "ranking": rank,
            "recommendation": recommendation
        })

    return {
        "job_id": job_id,
        "total_recommendations": len(results),
        "recommendations": results
    }