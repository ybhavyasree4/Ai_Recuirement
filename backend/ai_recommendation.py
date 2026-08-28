import os
import warnings
import logging

warnings.filterwarnings("ignore")

from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from database import SessionLocal
from models import JobApplication
from ai_retrieval import get_candidate_job_data
from rag_context import build_rag_context


# =========================
# LOAD ENVIRONMENT
# =========================

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("GROQ_API_KEY not found")
    raise SystemExit


# =========================
# GROQ MODEL
# =========================

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    api_key=api_key
)


# =========================
# PROMPT
# =========================

prompt = ChatPromptTemplate.from_template("""
You are an AI recruitment assistant.

Analyze the candidate and job information.

Classify the candidate as exactly one:

RECOMMENDED
CONSIDER
NOT RECOMMENDED

Use:
- ML Match Score
- Skill Match
- Candidate Skills
- Required Skills
- Education
- Experience
- Job Responsibilities

For RECOMMENDED or CONSIDER, return:

Recommendation: RECOMMENDED or CONSIDER

Why: <one or two simple sentences>

Strengths:
- <strength 1>
- <strength 2>

Skill Gaps:
- <skill gap 1>
- <skill gap 2>

Recruiter Action: <one clear action>

For NOT RECOMMENDED, return:

Recommendation: NOT RECOMMENDED

Why: <one or two simple sentences>

Recruiter Action: <one clear action>

Important:
- Do not invent information.
- Use only the provided context.
- Do not use Markdown.
- Do not use * or **.
- Keep the response simple and recruiter-friendly.
- Do not include Strengths or Skill Gaps for NOT RECOMMENDED.

Candidate and Job Context:

{context}
""")


chain = prompt | llm


# =========================
# DATABASE
# =========================

db = SessionLocal()

try:

    # Only applications without recommendations
    applications = (
        db.query(JobApplication)
        .filter(JobApplication.recommendation.is_(None))
        .order_by(JobApplication.application_id)
        .limit(100)
        .all()
    )

    total = len(applications)

    print("Database connected!")
    print("Processing:", total)
    print("-" * 50)


    # =========================
    # PROCESS APPLICATIONS
    # =========================

    for index, application in enumerate(applications, 1):

        try:

            print(
                f"Processing {index}/{total} "
                f"| Application ID: {application.application_id}"
            )

            # Get candidate + job data
            data = get_candidate_job_data(
                application.candidate_id,
                application.job_id
            )

            if not data:
                print("No candidate/job data found")
                continue

            # Build RAG context
            context = build_rag_context(data)

            # Send to Groq
            response = chain.invoke({
                "context": context
            })

            # Get Groq response
            recommendation = response.content

            if isinstance(recommendation, list):
                recommendation = "".join(
                    item.get("text", "")
                    for item in recommendation
                    if isinstance(item, dict)
                )

            recommendation = str(recommendation).strip()

            # Store in database
            application.recommendation = recommendation

            db.commit()

            print("Stored successfully")
            print("-" * 50)


        except Exception as e:

            db.rollback()

            print(
                f"Error at application "
                f"{application.application_id}: {e}"
            )


    print("Completed.")
    print("Recommendations stored in database.")


finally:

    db.close()