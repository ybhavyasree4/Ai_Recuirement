# AI Recruitment Platform

The AI Recruitment Platform is designed to help recruiters analyze resumes and job descriptions and identify suitable candidates using AI-based techniques.
The system works with both existing candidates from a dataset and new candidates whose resumes are uploaded as PDF files.

# The platform will automate tasks such as:

Resume screening
Candidate profiling
Job description analysis
Candidate-job matching
Skill-gap analysis
Candidate ranking
AI-based hiring recommendations

# Technology Stack
Python – Used to develop the main logic of the project.
FastAPI – Used to create the backend APIs.
Pandas – Used to process and manage data.
PyPDF – Used to extract text from resume PDF files.
SQLAlchemy – Used to define database models and communicate with PostgreSQL.
Psycopg2-binary – Used as the PostgreSQL database driver.give i
Python-dotenv – Used to load environment variables from .env.
Pydantic – Used to validate API request and response data.
Cloudinary - Stores uploaded resume files
LangChain – Used later for LLM and RAG workflow.
LLM (Grok) – Used later to analyze resumes and job descriptions.
Semantic Search – Finds the most relevant candidates for a job using TF-IDF and Cosine Similarity.
RAG – Used later to retrieve relevant information before generating AI recommendations.
PostgreSQL – Used to store candidate and job information.
Next.js – Used to create the frontend.

#  Database Schema

The database schema was designed to store and manage:

* Candidate information
* Resume information
* Skills
* Candidate skills
* Job information
* Job skills
* Applications
* Match results

# Virtual Environment

A Python virtual environment was created for the project.

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

# PostgreSQL Database

A PostgreSQL database named: ai_recruitment was created.

The database configuration is stored in .env.

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=ai_recruitment
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

The .env file is not uploaded to GitHub.

# Install dependcies
fastapi             → Backend API
uvicorn             → Run FastAPI server
pandas               → Data processing
pypdf                → Extract text from resume PDFs
sqlalchemy           → Handles database operations
psycopg2-binary      → Communicates with PostgreSQL
python-dotenv        → Read .env variables
langchain            → Builds LLM and RAG workflow
llm                  →  grok
Joblib               → Save and load trained ML models

# Machine Learning

- Scikit-learn – Machine Learning algorithms
- TF-IDF – Converts resume and job text into numerical features
- Random Forest Regressor – Predicts candidate-job match scores
- Joblib – Saves and loads trained ML models

# AI / NLP

-LangChain – LLM and RAG workflow
- Grok LLM – Planned AI analysis
- Semantic Search – Used to find the most relevant candidates for a particular job based on the similarity between job and candidate information.
- TF-IDF + Cosine Similarity – Used for semantic-style similarity search between job descriptions and candidate profiles.
- RAG – Planned retrieval-based AI recommendations

# Backend Structure
backend/
│
├── database.py
├── models.py
├── create_tables.py
│
├── upload_resume.py       # Uploads PDF resumes to Cloudinary
├── candidate_profiling.py # Extracts candidate information and skills
├── candidate_matching.py  # Calculates ML match scores for all candidates and jobs
├── predict_match.py       # Predicts match score for a candidate-job pair
├── semantic_search.py     # Finds top relevant candidates using similarity
├── skill_gap.py           # Finds matched and missing skills
├── ranking.py             # Calculates final score and ranks candidates
│
├── preprocess.py          # Loads dataset into the database
├── explore_data.py        # Explores the dataset
├── train.py               # Trains the ML model
├── test.py                # Tests the ML model
│
├── model.pkl              # Trained Random Forest model
├── vectorizer.pkl         # Trained TF-IDF vectorizer
├── test_data.csv          # Test data
│
└── .env                   # Database and Cloudinary configuration

# Machine Learning Workflow

The current ML workflow is:

Resume + Job Dataset
        ↓
Data Preprocessing
        ↓
Select Candidate + Job Information
        ↓
Combine Candidate + Job Text
        ↓
Train / Test Split
        ↓
TF-IDF Vectorization
        ↓
Random Forest Regressor
        ↓
Train Model
        ↓
Save Model + Vectorizer
        ↓
Test Model
        ↓
Predict Match Scores
        ↓
MAE / MSE / R² Evaluation

# Candidate Matching and Intelligence Workflow
Existing Candidates + New Resume Uploads
                  ↓
           Candidate Profiling
                  ↓
        Extract Candidate Skills
                  ↓
            Job Description
                  ↓
          Semantic Search
                  ↓
      Find Top Relevant Candidates
                  ↓
        Candidate-Job Matching
                  ↓
       Calculate ML Match Score
                  ↓
         Skill Gap Analysis
                  ↓
   Identify Matched + Missing Skills
                  ↓
          Calculate Final Score
                  ↓
         Candidate Ranking
                  ↓
      Rank Best Candidates for Job
