import ast
import re
import pandas as pd

from database import SessionLocal
from models import Candidate, CandidateSkill, Job, JobSkill, JobApplication


CSV_FILE = "resume_data_for_ranking.csv"


def clean(v):
    return str(v or "").strip()


def parse_list(v):
    v = clean(v)

    if not v:
        return []

    try:
        data = ast.literal_eval(v)

        if isinstance(data, str):
            data = [data]

    except:
        data = re.split(r",|\n", v)

    result = []
    seen = set()

    for item in data:
        item = clean(item)

        if item and item.lower() not in seen:
            seen.add(item.lower())
            result.append(item)

    return result


def candidate_key(row):
    return tuple(
        clean(row.get(x)).lower()
        for x in [
            "educational_institution_name",
            "degree_names",
            "major_field_of_studies",
            "professional_company_names",
            "positions",
            "passing_years"
        ]
    )


def job_key(row):
    return tuple(
        clean(row.get(x)).lower()
        for x in [
            "job_position_name",
            "educationaL_requirements",
            "experiencere_requirement",
            "responsibilities.1"
        ]
    )


def main():

    df = pd.read_csv(CSV_FILE).fillna("")

    print("CSV rows:", len(df))

    # --------------------------------------------------
    # REMOVE DUPLICATE CANDIDATES INSIDE CSV
    # --------------------------------------------------

    df["_candidate_key"] = df.apply(candidate_key, axis=1)

    unique_candidates = df.drop_duplicates("_candidate_key")

    db = SessionLocal()

    try:

        # ==================================================
        # LOAD EXISTING CANDIDATES
        # ==================================================

        candidates = {}

        for c in db.query(Candidate).all():

            key = (
                clean(c.educational_institution_name).lower(),
                clean(c.degree_names).lower(),
                clean(c.major_field_of_studies).lower(),
                clean(c.professional_company_names).lower(),
                clean(c.positions).lower(),
                clean(c.passing_years).lower()
            )

            candidates[key] = c

        # --------------------------------------------------
        # ALSO LOAD EXISTING RESUMES
        # --------------------------------------------------

        existing_resumes = {}

        for c in db.query(Candidate).all():

            resume_text = clean(c.resume_text)

            if resume_text:
                existing_resumes[resume_text.lower()] = c

        candidate_map = {}

        new_candidates = 0
        new_candidate_skills = 0
        already_existing_candidates = 0

        # ==================================================
        # CANDIDATES
        # ==================================================

        for i, row in unique_candidates.iterrows():

            key = row["_candidate_key"]

            resume_text = clean(row.get("resume_text"))

            # --------------------------------------------------
            # CHECK SAME RESUME
            # --------------------------------------------------

            if resume_text:

                resume_key = resume_text.lower()

                if resume_key in existing_resumes:

                    existing_candidate = existing_resumes[resume_key]

                    candidate_map[key] = existing_candidate

                    candidates[key] = existing_candidate

                    already_existing_candidates += 1

                    print(
                        f"Already existed: Candidate ID "
                        f"{existing_candidate.candidate_id}"
                    )

                    continue

            # --------------------------------------------------
            # CHECK CANDIDATE KEY
            # --------------------------------------------------

            if key in candidates:

                existing_candidate = candidates[key]

                candidate_map[key] = existing_candidate

                already_existing_candidates += 1

                print(
                    f"Already existed: Candidate ID "
                    f"{existing_candidate.candidate_id}"
                )

                continue

            # ==================================================
            # CREATE NEW CANDIDATE
            # ==================================================

            c = Candidate(

                resume_file_name=f"CSV_CANDIDATE_{i}.pdf",

                resume_text=resume_text,

                address=clean(row.get("address")),

                career_objective=clean(
                    row.get("career_objective")
                ),

                educational_institution_name=clean(
                    row.get("educational_institution_name")
                ),

                degree_names=clean(
                    row.get("degree_names")
                ),

                passing_years=clean(
                    row.get("passing_years")
                ),

                educational_results=clean(
                    row.get("educational_results")
                ),

                major_field_of_studies=clean(
                    row.get("major_field_of_studies")
                ),

                professional_company_names=clean(
                    row.get("professional_company_names")
                ),

                company_urls=clean(
                    row.get("company_urls")
                ),

                start_dates=clean(
                    row.get("start_dates")
                ),

                end_dates=clean(
                    row.get("end_dates")
                ),

                related_skils_in_job=clean(
                    row.get("related_skils_in_job")
                ),

                positions=clean(
                    row.get("positions")
                ),

                locations=clean(
                    row.get("locations")
                ),

                responsibilities=clean(
                    row.get("responsibilities")
                ),

                role_positions=clean(
                    row.get("role_positions")
                ),

                languages=clean(
                    row.get("languages")
                ),

                proficiency_levels=clean(
                    row.get("proficiency_levels")
                ),

                certification_providers=clean(
                    row.get("certification_providers")
                )
            )

            db.add(c)

            db.flush()

            candidates[key] = c

            candidate_map[key] = c

            # Add resume to existing resume dictionary
            if resume_text:

                existing_resumes[
                    resume_text.lower()
                ] = c

            new_candidates += 1

            print(
                f"New candidate: Candidate ID {c.candidate_id}"
            )

            # ==================================================
            # CANDIDATE SKILLS
            # ==================================================

            skills = parse_list(
                row.get("skills")
            )

            for skill in skills:

                db.add(
                    CandidateSkill(
                        candidate_id=c.candidate_id,
                        skill_name=skill
                    )
                )

                new_candidate_skills += 1

        # ==================================================
        # JOBS
        # ==================================================

        jobs = {}

        for j in db.query(Job).all():

            key = (

                clean(
                    j.job_position_name
                ).lower(),

                clean(
                    j.educationaL_requirements
                ).lower(),

                clean(
                    j.experiencere_requirement
                ).lower(),

                clean(
                    j.responsibilities
                ).lower()
            )

            jobs[key] = j

        new_jobs = 0
        new_job_skills = 0

        # ==================================================
        # CREATE JOBS
        # ==================================================

        for _, row in df.iterrows():

            key = job_key(row)

            if key in jobs:

                continue

            j = Job(

                job_position_name=clean(
                    row.get("job_position_name")
                ),

                educationaL_requirements=clean(
                    row.get("educationaL_requirements")
                ),

                experiencere_requirement=clean(
                    row.get("experiencere_requirement")
                ),

                age_requirement=clean(
                    row.get("age_requirement")
                ),

                responsibilities=clean(
                    row.get("responsibilities.1")
                )
            )

            db.add(j)

            db.flush()

            jobs[key] = j

            new_jobs += 1

            # ==================================================
            # JOB SKILLS
            # ==================================================

            skills = parse_list(
                row.get("skills_required")
            )

            for skill in skills:

                db.add(
                    JobSkill(
                        job_id=j.job_id,
                        skill_name=skill
                    )
                )

                new_job_skills += 1

        # ==================================================
        # EXISTING APPLICATIONS
        # ==================================================

        existing_apps = {

            (
                a.candidate_id,
                a.job_id
            )

            for a in db.query(JobApplication).all()
        }

        new_applications = 0

        # ==================================================
        # APPLICATIONS
        # ==================================================

        for _, row in df.iterrows():

            c = candidate_map.get(
                row["_candidate_key"]
            )

            j = jobs.get(
                job_key(row)
            )

            if not c or not j:

                continue

            pair = (
                c.candidate_id,
                j.job_id
            )

            # --------------------------------------------------
            # APPLICATION ALREADY EXISTS
            # --------------------------------------------------

            if pair in existing_apps:

                continue

            try:

                score = float(
                    row.get(
                        "matched_score",
                        0
                    )
                )

            except:

                score = 0.0

            db.add(

                JobApplication(

                    candidate_id=c.candidate_id,

                    job_id=j.job_id,

                    match_score=score,

                    skill_match_percentage=0,

                    matched_skills="",

                    missing_skills="",

                    skill_gap="",

                    ranking=0,

                    recommendation="Pending Analysis",

                    application_status="Applied"
                )
            )

            existing_apps.add(pair)

            new_applications += 1

        # ==================================================
        # COMMIT
        # ==================================================

        db.commit()

        print("\nImport completed!")

        print(
            "New candidates:",
            new_candidates
        )

        print(
            "Already existed:",
            already_existing_candidates
        )

        print(
            "New candidate skills:",
            new_candidate_skills
        )

        print(
            "New jobs:",
            new_jobs
        )

        print(
            "New job skills:",
            new_job_skills
        )

        print(
            "New applications:",
            new_applications
        )

        # ==================================================
        # DATABASE COUNTS
        # ==================================================

        print("\nDATABASE COUNTS")

        print(
            "Candidates:",
            db.query(Candidate).count()
        )

        print(
            "Candidate Skills:",
            db.query(CandidateSkill).count()
        )

        print(
            "Jobs:",
            db.query(Job).count()
        )

        print(
            "Job Skills:",
            db.query(JobSkill).count()
        )

        print(
            "Applications:",
            db.query(JobApplication).count()
        )

    except Exception as e:

        db.rollback()

        print("ERROR:", e)

    finally:

        db.close()


if __name__ == "__main__":
    main()