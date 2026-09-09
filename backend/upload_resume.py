import os
from pathlib import Path

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pypdf import PdfReader

from backend.database import SessionLocal
from backend.models import Candidate


# Load .env
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)


def extract_text(pdf):
    reader = PdfReader(str(pdf))

    text = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        text.append(page_text)

    return "\n".join(text)


def normalize_text(text):
    """
    Used only for checking whether the same resume
    was uploaded again with a different filename.
    """
    return " ".join((text or "").lower().split())


def process_single_resume(pdf_path):
    db = SessionLocal()

    try:
        pdf = Path(pdf_path)

        # ------------------------------------------------
        # 1. Extract resume text FIRST
        # ------------------------------------------------
        resume_text = extract_text(pdf)

        if not resume_text.strip():
            raise Exception("Could not extract text from the resume.")

        normalized_resume = normalize_text(resume_text)

        # ------------------------------------------------
        # 2. Check by filename
        # ------------------------------------------------
        existing = (
            db.query(Candidate)
            .filter(Candidate.resume_file_name == pdf.name)
            .first()
        )

        if existing:
            return {
                "message": "Resume already existed",
                "already_exists": True,
                "candidate_id": existing.candidate_id,
                "file_name": existing.resume_file_name,
                "cloudinary_url": existing.resume_file_path
            }

        # ------------------------------------------------
        # 3. Check by resume CONTENT
        #    This catches:
        #
        #    TRIPURNA.pdf
        #    TRIPURNA(1).pdf
        #    resume.pdf
        #
        #    when the actual resume is the same.
        # ------------------------------------------------
        candidates = (
            db.query(Candidate)
            .filter(Candidate.resume_text.isnot(None))
            .all()
        )

        for candidate in candidates:
            existing_text = normalize_text(candidate.resume_text)

            if existing_text and existing_text == normalized_resume:
                return {
                    "message": "Resume already existed",
                    "already_exists": True,
                    "candidate_id": candidate.candidate_id,
                    "file_name": candidate.resume_file_name,
                    "cloudinary_url": candidate.resume_file_path
                }

        # ------------------------------------------------
        # 4. Resume is genuinely NEW
        # ------------------------------------------------
        result = cloudinary.uploader.upload(
            str(pdf),
            resource_type="raw",
            folder="resumes",
            public_id=pdf.stem,
            overwrite=False
        )

        url = result["secure_url"]

        # ------------------------------------------------
        # 5. Create NEW candidate
        # ------------------------------------------------
        candidate = Candidate(
            resume_file_name=pdf.name,
            resume_file_path=url,
            resume_text=resume_text
        )

        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        return {
            "message": "Resume uploaded successfully",
            "already_exists": False,
            "candidate_id": candidate.candidate_id,
            "file_name": candidate.resume_file_name,
            "cloudinary_url": candidate.resume_file_path,
            "text_extracted": True
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def process_resumes(folder):
    for pdf in Path(folder).glob("*.pdf"):

        print(f"\nProcessing: {pdf.name}")

        try:
            result = process_single_resume(pdf)
            print(result)

        except Exception as e:
            print(f"Failed: {e}")


if __name__ == "__main__":
    folder = input("Enter resume folder path: ").strip()
    process_resumes(folder)