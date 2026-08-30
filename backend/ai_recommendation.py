import os
import json
import time

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from models import JobApplication
from ai_retrieval import get_candidate_job_data
from rag_context import build_rag_context

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise Exception("GROQ_API_KEY not found")

llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    api_key=api_key
)

prompt = ChatPromptTemplate.from_template("""
You are an AI recruitment assistant.

The candidate is already selected as one of the TOP 5 candidates for this job.

Analyze the candidate and job information.

Return ONLY valid JSON.

Use exactly this format:

{{
    "recommendation": "RECOMMENDED",
    "why": "One or two simple sentences explaining why the candidate is suitable.",
    "strengths": [
        "strength 1",
        "strength 2"
    ],
    "skill_gaps": [
        "skill gap 1",
        "skill gap 2"
    ],
    "recruiter_action": "One clear recruiter action."
}}

Rules:
- Recommendation must be RECOMMENDED.
- Do not change the recommendation.
- Use only the provided context.
- Do not invent information.
- Keep the response simple.
- Mention real candidate strengths.
- Mention real skill gaps if available.
- Return JSON only.

Candidate and Job Context:

{context}
""")

chain = prompt | llm


def clean_response(text):

    text = str(text).strip()

    if text.startswith("```"):
        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

    try:
        return json.loads(text)

    except Exception:
        return {
            "recommendation": "RECOMMENDED",
            "why": text,
            "strengths": [],
            "skill_gaps": [],
            "recruiter_action":
                "Invite the candidate for an interview."
        }


def generate_ai_recommendations(db):

    job_ids = (
        db.query(JobApplication.job_id)
        .distinct()
        .all()
    )

    recommendations = []

    for (job_id,) in job_ids:

        applications = (
            db.query(JobApplication)
            .filter(
                JobApplication.job_id == job_id
            )
            .order_by(
                JobApplication.match_score.desc()
            )
            .all()
        )

        if not applications:
            continue

        ranked = []

        for application in applications:

            match_score = float(
                application.match_score or 0
            )

            skill_score = float(
                application.skill_match_percentage or 0
            )

            final_score = (
                match_score * 50
                + skill_score * 0.5
            )

            ranked.append(
                (
                    application,
                    final_score
                )
            )

        ranked.sort(
            key=lambda x: x[1],
            reverse=True
        )

        top_5 = ranked[:5]

        for rank, (application, final_score) in enumerate(
            top_5,
            start=1
        ):

            application.ranking = rank

            # Already processed
            if application.recommendation:

                try:
                    recommendation = json.loads(
                        application.recommendation
                    )
                except Exception:
                    recommendation = {
                        "recommendation":
                            "RECOMMENDED",
                        "why":
                            application.recommendation
                    }

                recommendations.append({
                    "application_id":
                        application.application_id,
                    "candidate_id":
                        application.candidate_id,
                    "job_id":
                        application.job_id,
                    "ranking":
                        rank,
                    "recommendation":
                        recommendation
                })

                continue

            try:

                data = get_candidate_job_data(
                    application.candidate_id,
                    application.job_id
                )

                if not data:
                    continue

                context = build_rag_context(data)

                response = chain.invoke({
                    "context": context
                })

                result = clean_response(
                    response.content
                )

                result["recommendation"] = "RECOMMENDED"

                application.recommendation = json.dumps(
                    result,
                    ensure_ascii=False
                )

                db.commit()

                recommendations.append({
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

                time.sleep(1)

            except Exception as e:

                db.rollback()

                print(
                    f"Error in Application "
                    f"{application.application_id}: {e}"
                )

                continue

    return {
        "message":
            "AI recommendations generated successfully",
        "total":
            len(recommendations),
        "recommendations":
            recommendations
    }