from sqlalchemy import Column, Integer, String, Text, Float
from database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id = Column(Integer, primary_key=True, index=True)
    resume_file_name = Column(String(255))
    resume_file_path = Column(Text)
    resume_text = Column(Text)
    address = Column(Text)
    career_objective = Column(Text)
    educational_institution_name = Column(Text)
    degree_names = Column(Text)
    passing_years = Column(Text)
    educational_results = Column(Text)
    major_field_of_studies = Column(Text)
    professional_company_names = Column(Text)
    company_urls = Column(Text)
    related_skils_in_job = Column(Text)
    positions = Column(Text)
    locations = Column(Text)
    responsibilities = Column(Text)
    role_positions = Column(Text)
    languages = Column(Text)
    proficiency_levels = Column(Text)
    certification_providers = Column(Text)


class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer)
    skill_name = Column(Text)


class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index=True)
    job_position_name = Column(String)
    educationaL_requirements = Column(Text)
    experiencere_requirement = Column(Text)
    age_requirement = Column(Text)
    responsibilities = Column(Text)


class JobSkill(Base):
    __tablename__ = "job_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer)
    skill_name = Column(Text)


class JobApplication(Base):
    __tablename__ = "job_applications"

    application_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer)
    job_id = Column(Integer)
    match_score = Column(Float)

    skill_match_percentage = Column(Float)
    matched_skills = Column(Text)
    missing_skills = Column(Text)


    ranking = Column(Integer)
    recommendation = Column(String)
    application_status = Column(String)