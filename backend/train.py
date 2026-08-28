import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor

# Load dataset
df = pd.read_csv("resume_data_for_ranking.csv").fillna("")
print("Dataset loaded:", len(df))

cols = [
    "career_objective",
    "skills",
    "degree_names",
    "major_field_of_studies",
    "professional_company_names",
    "positions",
    "responsibilities",
    "certification_skills",
    "languages",
    "proficiency_levels",
    "job_position_name",
    "educationaL_requirements",
    "experiencere_requirement",
    "responsibilities.1",
    "skills_required"
]

# Keep only columns that exist
cols = [c for c in cols if c in df.columns]

# Convert match score to number
df["matched_score"] = pd.to_numeric(
    df["matched_score"],
    errors="coerce"
)

df = df.dropna(subset=["matched_score"])

# Combine resume + job information
X = df[cols].astype(str).agg(" ".join, axis=1)
y = df["matched_score"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

print("Training:", len(X_train))
print("Testing:", len(X_test))

# TF-IDF
vectorizer = TfidfVectorizer(
    max_features=5000,
    stop_words="english"
)

X_train = vectorizer.fit_transform(X_train)

# Train model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# Save
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("\nModel trained successfully!")
print("model.pkl created!")
print("vectorizer.pkl created!")