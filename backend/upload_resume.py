# import os
# from pathlib import Path

# import cloudinary
# import cloudinary.uploader
# from dotenv import load_dotenv
# from pypdf import PdfReader

# from database import SessionLocal
# from models import Candidate


# load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# cloudinary.config(
#     cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
#     api_key=os.getenv("CLOUDINARY_API_KEY"),
#     api_secret=os.getenv("CLOUDINARY_API_SECRET")
# )


# def extract_text(pdf):
#     reader = PdfReader(str(pdf))
#     return "\n".join(page.extract_text() or "" for page in reader.pages)


# def process_resumes(folder):
#     db = SessionLocal()

#     try:
#         for pdf in Path(folder).glob("*.pdf"):
#             print(f"\nProcessing: {pdf.name}")

#             try:
#                 # Check duplicate
#                 existing = db.query(Candidate).filter(
#                     Candidate.resume_file_name == pdf.name
#                 ).first()

#                 if existing:
#                     print(f"Already exists | Candidate ID: {existing.candidate_id}")
#                     print(f"Cloudinary URL: {existing.resume_file_path}")
#                     continue

#                 # Upload
#                 result = cloudinary.uploader.upload(
#                     str(pdf),
#                     resource_type="raw",
#                     folder="resumes",
#                     public_id=pdf.stem,
#                     overwrite=False
#                 )

#                 url = result["secure_url"]

#                 # Save candidate
#                 candidate = Candidate(
#                     resume_file_name=pdf.name,
#                     resume_file_path=url,
#                     resume_text=extract_text(pdf)
#                 )

#                 db.add(candidate)
#                 db.commit()
#                 db.refresh(candidate)

#                 print(f"Added | Candidate ID: {candidate.candidate_id}")
#                 print(f"Cloudinary URL: {url}")

#             except Exception as e:
#                 db.rollback()
#                 print(f"Failed: {e}")

#     finally:
#         db.close()


# if __name__ == "__main__":
#     folder = input("Enter resume folder path: ").strip()
#     process_resumes(folder)
import os
from pathlib import Path

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from pypdf import PdfReader

from database import SessionLocal
from models import Candidate


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

    return "\n".join(
        page.extract_text() or ""
        for page in reader.pages
    )


# Function for FastAPI
def process_single_resume(pdf_path):
    db = SessionLocal()

    try:
        pdf = Path(pdf_path)

        # Check duplicate
        existing = db.query(Candidate).filter(
            Candidate.resume_file_name == pdf.name
        ).first()

        if existing:
            return {
                "message": "Resume already exists",
                "candidate_id": existing.candidate_id,
                "cloudinary_url": existing.resume_file_path
            }

        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            str(pdf),
            resource_type="raw",
            folder="resumes",
            public_id=pdf.stem,
            overwrite=False
        )

        url = result["secure_url"]

        # Extract resume text
        resume_text = extract_text(pdf)

        # Save candidate
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
            "candidate_id": candidate.candidate_id,
            "file_name": pdf.name,
            "cloudinary_url": url,
            "text_extracted": bool(resume_text.strip())
        }

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()


# Existing bulk upload function
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