import os
import json
import re

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from backend.models import JobApplication
from backend.ai_retrieval import get_candidate_job_data
from backend.rag_context import build_rag_context


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise Exception("GROQ_API_KEY not found")


# ============================================================
# GROQ
# ============================================================

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    max_tokens=500,
    api_key=api_key
)


# ============================================================
# PROMPT
# ============================================================

prompt = ChatPromptTemplate.from_template("""
You are an AI recruitment assistant helping a recruiter.

The candidate has already been ranked.

You MUST use exactly this recommendation type:

{recommendation_type}

Do NOT change it.

Analyze ONLY the candidate and job information provided below.

============================================================
FOR RECOMMENDED
============================================================

Return exactly:

{{
  "recommendation": "RECOMMENDED",
  "why": "One or two simple sentences explaining why this candidate is suitable.",
  "strengths": [
    "Specific candidate strength related to the job",
    "Another specific candidate strength related to the job"
  ],
  "skill_gaps": [
    "Specific missing skill",
    "Another missing skill"
  ],
  "recruiter_action": "One clear recruiter action."
}}

============================================================
FOR CONSIDER
============================================================

Return exactly:

{{
  "recommendation": "CONSIDER",
  "why": "One or two simple sentences explaining why this candidate may be worth reviewing.",
  "strengths": [
    "Specific candidate strength related to the job",
    "Another specific candidate strength related to the job"
  ],
  "skill_gaps": [
    "Specific missing skill",
    "Another missing skill"
  ],
  "recruiter_action": "One clear recruiter action."
}}

============================================================
FOR NOT RECOMMENDED
============================================================

Return exactly:

{{
  "recommendation": "NOT RECOMMENDED",
  "why": "One or two simple sentences explaining why the candidate is not suitable.",
  "recruiter_action": "One clear recruiter action."
}}

============================================================
IMPORTANT RULES
============================================================

1. Do not change the recommendation type.
2. Do not invent candidate information.
3. Use only the provided candidate and job context.
4. RECOMMENDED MUST contain strengths and skill_gaps.
5. CONSIDER MUST contain strengths and skill_gaps.
6. NOT RECOMMENDED MUST NOT contain strengths or skill_gaps.
7. strengths must contain at least 2 useful items for RECOMMENDED and CONSIDER.
8. skill_gaps must contain at least 1 useful item when gaps exist.
9. Keep the language simple.
10. Return JSON only.
11. Do not use Markdown.
12. Do not use ```.

============================================================
CANDIDATE AND JOB CONTEXT
============================================================

{context}
""")


chain = prompt | llm


# ============================================================
# CLEAN JSON
# ============================================================

def clean_json_response(text):

    if not text:
        return None

    text = str(text).strip()

    # Remove markdown fences
    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    # Find first {
    start = text.find("{")

    # Find last }
    end = text.rfind("}")

    if start == -1 or end == -1:
        return None

    text = text[start:end + 1]

    try:
        return json.loads(text)

    except json.JSONDecodeError:

        # Try to repair common trailing comma issue
        repaired = re.sub(
            r",\s*([}\]])",
            r"\1",
            text
        )

        try:
            return json.loads(repaired)

        except Exception:
            return None


# ============================================================
# CREATE FALLBACK
# ============================================================

def create_fallback(recommendation_type):

    if recommendation_type == "RECOMMENDED":

        return {
            "recommendation": "RECOMMENDED",
            "why": "The candidate is among the top-ranked applicants for this job.",
            "strengths": [
                "Relevant skills or experience identified from the candidate profile",
                "Potentially transferable experience for the role"
            ],
            "skill_gaps": [
                "Some job-specific skills may require further assessment"
            ],
            "recruiter_action": "Review the candidate and consider scheduling an interview."
        }

    elif recommendation_type == "CONSIDER":

        return {
            "recommendation": "CONSIDER",
            "why": "The candidate has some relevant experience but may have skill gaps compared with the top-ranked candidates.",
            "strengths": [
                "Relevant transferable experience",
                "Some skills related to the job requirements"
            ],
            "skill_gaps": [
                "Some job-specific skills may require further assessment"
            ],
            "recruiter_action": "Review the candidate and assess suitability in an interview."
        }

    else:

        return {
            "recommendation": "NOT RECOMMENDED",
            "why": "The candidate does not sufficiently match the main requirements of the job.",
            "recruiter_action": "Do not advance this candidate and review other applicants."
        }


# ============================================================
# NORMALIZE RESULT
# ============================================================

def normalize_result(result, recommendation_type):

    if not isinstance(result, dict):
        result = {}

    # --------------------------------------------------------
    # RECOMMENDED
    # --------------------------------------------------------

    if recommendation_type == "RECOMMENDED":

        strengths = result.get("strengths")

        if not isinstance(strengths, list) or len(strengths) == 0:
            strengths = [
                "Relevant experience or transferable skills identified from the profile",
                "Potential fit with the job requirements"
            ]

        skill_gaps = result.get("skill_gaps")

        if not isinstance(skill_gaps, list):
            skill_gaps = []

        return {
            "recommendation": "RECOMMENDED",

            "why": str(
                result.get(
                    "why",
                    "The candidate is among the top-ranked applicants and has relevant experience or transferable skills."
                )
            ),

            "strengths": strengths,

            "skill_gaps": skill_gaps,

            "recruiter_action": str(
                result.get(
                    "recruiter_action",
                    "Review the candidate and consider scheduling an interview."
                )
            )
        }

    # --------------------------------------------------------
    # CONSIDER
    # --------------------------------------------------------

    if recommendation_type == "CONSIDER":

        strengths = result.get("strengths")

        if not isinstance(strengths, list) or len(strengths) == 0:
            strengths = [
                "Relevant transferable experience",
                "Some skills aligned with the job requirements"
            ]

        skill_gaps = result.get("skill_gaps")

        if not isinstance(skill_gaps, list):
            skill_gaps = []

        return {
            "recommendation": "CONSIDER",

            "why": str(
                result.get(
                    "why",
                    "The candidate has some relevant experience but also has skill gaps that should be assessed."
                )
            ),

            "strengths": strengths,

            "skill_gaps": skill_gaps,

            "recruiter_action": str(
                result.get(
                    "recruiter_action",
                    "Review the candidate and assess suitability in an interview."
                )
            )
        }

    # --------------------------------------------------------
    # NOT RECOMMENDED
    # --------------------------------------------------------

    return {
        "recommendation": "NOT RECOMMENDED",

        "why": str(
            result.get(
                "why",
                "The candidate does not sufficiently match the main requirements of the job."
            )
        ),

        "recruiter_action": str(
            result.get(
                "recruiter_action",
                "Do not advance this candidate and review other applicants."
            )
        )
    }


# ============================================================
# GET TOP 5
# ============================================================

def get_top_5_applications(db, job_id):

    return (
        db.query(JobApplication)
        .filter(
            JobApplication.job_id == job_id
        )
        .order_by(
            JobApplication.match_score.desc(),
            JobApplication.skill_match_percentage.desc(),
            JobApplication.application_id.asc()
        )
        .limit(5)
        .all()
    )


# ============================================================
# GENERATE AI RECOMMENDATIONS
# ============================================================

def generate_ai_recommendations(db):

    job_ids = (
        db.query(JobApplication.job_id)
        .distinct()
        .all()
    )

    all_recommendations = []

    for (job_id,) in job_ids:

        applications = get_top_5_applications(
            db,
            job_id
        )

        if not applications:
            continue

        for rank, application in enumerate(
            applications,
            start=1
        ):

            # ------------------------------------------------
            # RECOMMENDATION TYPE BASED ON RANK
            # ------------------------------------------------

            if rank in [1, 2]:

                recommendation_type = "RECOMMENDED"

            elif rank == 3:

                recommendation_type = "CONSIDER"

            else:

                recommendation_type = "NOT RECOMMENDED"

            # ------------------------------------------------
            # CHECK EXISTING DATA
            # ------------------------------------------------

            result = None

            if application.recommendation:

                try:

                    old_result = json.loads(
                        application.recommendation
                    )

                    # Normalize OLD records too
                    result = normalize_result(
                        old_result,
                        recommendation_type
                    )

                except Exception:

                    result = None

            # ------------------------------------------------
            # GENERATE IF MISSING / INVALID
            # ------------------------------------------------

            if result is None:

                try:

                    data = get_candidate_job_data(
                        application.candidate_id,
                        application.job_id
                    )

                    if data:

                        context = build_rag_context(
                            data
                        )

                        response = chain.invoke({

                            "context": context,

                            "recommendation_type":
                                recommendation_type
                        })

                        parsed = clean_json_response(
                            response.content
                        )

                        if parsed:

                            result = normalize_result(
                                parsed,
                                recommendation_type
                            )

                except Exception:

                    result = None

            # ------------------------------------------------
            # FALLBACK
            # ------------------------------------------------

            if result is None:

                result = create_fallback(
                    recommendation_type
                )

            # ------------------------------------------------
            # FORCE CORRECT TYPE
            # ------------------------------------------------

            result["recommendation"] = (
                recommendation_type
            )

            # ------------------------------------------------
            # SAVE TO DATABASE
            # ------------------------------------------------

            application.recommendation = json.dumps(
                result,
                ensure_ascii=False
            )

            db.commit()

            # ------------------------------------------------
            # ADD RESULT
            # ------------------------------------------------

            all_recommendations.append({

                "application_id":
                    application.application_id,

                "candidate_id":
                    application.candidate_id,

                "job_id":
                    application.job_id,

                "ranking":
                    rank,

                "recommendation":
                    result
            })

    return {

        "message":
            "AI recommendations completed successfully",

        "total":
            len(all_recommendations),

        "recommendations":
            all_recommendations
    }