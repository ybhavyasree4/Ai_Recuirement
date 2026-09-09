# AI Recruitment Platform

The AI Recruitment Platform is an end-to-end web application designed to help recruiters automate and improve the candidate screening and selection process.

The platform analyzes resumes and job requirements to provide candidate profiles, job matching, skill-gap analysis, candidate ranking, and AI-powered hiring recommendations.

# Project Description

This project develops an end-to-end AI-powered recruitment platform that automates:

* Resume screening
* Candidate profiling
* Job matching
* Skill-gap analysis
* Candidate ranking
* Candidate shortlisting
* AI-based hiring recommendations

The system uses Large Language Models (LLMs), semantic search, and Retrieval-Augmented Generation (RAG) to analyze candidate resumes and job descriptions and assist recruiters in making better hiring decisions.

# Project Overview

The platform reduces the manual effort involved in resume screening and candidate selection.

The main workflow is:

Recruiter
    ↓
Next.js Frontend
    ↓
FastAPI Backend
    ↓
PostgreSQL Database
    ↓
Resume & Job Data
    ↓
Matching / Machine Learning
    ↓
Candidate Ranking
    ↓
AI / RAG Analysis
    ↓
Hiring Recommendation


# Main Features

# Recruiter Management

* Recruiter signup
* Recruiter login
* Recruiter dashboard

# Resume Processing

* Resume upload
* Resume text extraction
* Candidate profiling
* Candidate information extraction
* Candidate skill extraction
* Cloudinary resume storage

# Job Management

* Job management
* Job requirement analysis
* Required skill management

# Candidate Matching

* Candidate-job matching
* Match score calculation
* Semantic search
* Skill-gap analysis
* Candidate ranking

# Recruitment Decision Support

* Candidate shortlisting
* AI-powered hiring recommendations
* Recommendation categories such as:

  * Recommended
  * Consider
  * Not Recommended

# Data Management

* Supabase,PostgreSQL database
* Candidate data storage
* Job data storage
* Application data storage


# Technology Stack

# Frontend

* Next.js
* React
* JavaScript
* Font Awesome
* Tailwind CSS

# Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* Pandas
* PyPDF
* Psycopg2
* Python-dotenv

# Database

* PostgreSQL

# Machine Learning

* Scikit-learn
* TF-IDF
* Cosine Similarity
* Random Forest Regressor
* Joblib

# Generative AI

* LangChain
* Groq LLM
* Google Gemini
* Retrieval-Augmented Generation (RAG)

# File Storage

* Cloudinary


# AI and Machine Learning

The platform combines traditional machine learning techniques with Generative AI.

# Resume and Job Matching

Resume and job information is processed to calculate candidate-job similarity.

The system uses:
Resume Data
     +
Job Requirements
     ↓
Text Preprocessing
     ↓
TF-IDF
     ↓
Cosine Similarity / ML Model
     ↓
Match Score


# Candidate Ranking

Candidates are ranked according to their matching scores for the selected job.

Candidates
    ↓
Match Score
    ↓
Sorting
    ↓
Candidate Ranking


### Skill-Gap Analysis

The system compares candidate skills with the skills required for a job.

Candidate Skills
       +
Required Job Skills
       ↓
Skill Comparison
       ↓
Matched Skills
       +
Missing Skills
       ↓
Skill Gap


## AI Hiring Recommendation

The platform uses an LLM and RAG-based workflow to analyze relevant candidate and job information and generate a hiring recommendation.

Candidate Information
        +
Job Information
        +
Skills
        +
Match Results
        ↓
RAG Context
        ↓
LLM
        ↓
AI Hiring Recommendation


# System Architecture

                       Recruiter
                           |
                           v
                  Next.js Frontend
                           |
                           v
                    FastAPI Backend
                           |
              +------------+-------------+
              |            |             |
              v            v             v
         PostgreSQL     ML Model      AI / RAG
              |            |             |
              |            v             v
              |        Match Score   Recommendation
              |
              v
       Candidate / Job /
       Application Data


# Project Structure

AI_Recuirement/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── upload_resume.py
│   ├── candidate_profiling.py
│   ├── ranking.py
│   ├── skill_gap.py
│   ├── ai_recommendation.py
│   ├── ai_retrieval.py
│   ├── rag_context.py
│   ├── predict.py
│   ├── model.pkl
│   ├── vectorizer.pkl
│   ├── requirements.txt
│   └── ...
│
├── README.md
└── ...


# Database
Supabase (PostgreSQL)

The application uses Supabase as the database platform. Supabase provides the PostgreSQL database used to store:

Candidate information
Candidate skills
Job information
Job skills
Job applications
Match scores
Rankings
AI recommendations

# API

The backend is implemented using FastAPI.

Example endpoints include:

```text
GET  /
GET  /candidates
GET  /jobs
GET  /applications
POST /upload-resume
```

FastAPI also provides API documentation through Swagger UI.

http://localhost:8000/docs


# Setup and Installation

# Backend

Open a terminal and navigate to the backend folder:

cd backend


Create and activate a Python virtual environment:

python -m venv venv


Activate it on Windows:

venv\Scripts\activate


Install the required dependencies:


pip install -r requirements.txt


Run the FastAPI backend:


uvicorn main:app --reload


The backend will run on:

http://localhost:8000


Swagger API documentation:

http://localhost:8000/docs


## Frontend

Navigate to the frontend folder:
cd frontend

Install dependencies:

npm install

Run the development server:


npm run dev


The frontend will normally run on:

```text
http://localhost:3000
```

---

# Environment Variables

API keys and database credentials should be stored in a `.env` file.

Example:

DATABASE_URL=your_database_connection
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# End-to-End Workflow


1. Recruiter logs into the platform
             ↓
2. Recruiter uploads a resume
             ↓
3. Resume text is extracted
             ↓
4. Candidate profile is generated
             ↓
5. Candidate skills are extracted
             ↓
6. Candidate is compared with job requirements
             ↓
7. Match score is calculated
             ↓
8. Skill gaps are identified
             ↓
9. Candidates are ranked
             ↓
10. Relevant candidate/job information is retrieved
             ↓
11. RAG context is created
             ↓
12. LLM generates hiring recommendation
             ↓
13. Recruiter reviews the recommendation
             ↓
14. Recruiter can shortlist suitable candidates



# Objective

The main objective of this project is to build an intelligent recruitment system that can reduce manual resume screening effort and provide recruiters with data-driven and AI-assisted candidate evaluation.

The platform combines web development, machine learning, semantic matching, LLMs, and RAG into a single recruitment workflow.
