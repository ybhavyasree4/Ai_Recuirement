import pandas as pd

# Load original dataset
df = pd.read_csv("resume_data_for_ranking.csv").fillna("")

print("DATASET EXPLORATION")
print("=" * 40)


# 1. Shape
print("\n1. Dataset Shape")
print("Rows:", df.shape[0])
print("Columns:", df.shape[1])


# 2. Columns
print("\n2. Columns")
print(df.columns.tolist())


# 3. First 5 rows
print("\n3. First 5 Rows")
print(df.head())


# 4. Data types
print("\n4. Data Types")
print(df.dtypes)


# 5. Missing values
print("\n5. Missing Values")
print(df.isnull().sum())


# 6. Exact duplicate rows
print("\n6. Exact Duplicate Rows")
print("Duplicates:", df.duplicated().sum())


# 7. Remove exact duplicate rows
df = df.drop_duplicates()

print("\nAfter Removing Exact Duplicates")
print("Remaining Rows:", len(df))


# 8. Duplicate candidate profiles
print("\n7. Duplicate Candidate Profiles")

candidate_profile_columns = [
    "career_objective",
    "degree_names",
    "major_field_of_studies",
    "professional_company_names",
    "positions",
    "responsibilities",
    "skills"
]

duplicate_profiles = df.duplicated(
    subset=candidate_profile_columns,
    keep=False
)

print(
    "Duplicate profile rows:",
    duplicate_profiles.sum()
)


# 9. Remove duplicate candidate profiles
df = df.drop_duplicates(
    subset=candidate_profile_columns,
    keep="first"
)

print("\nAfter Removing Duplicate Candidate Profiles")
print("Remaining Rows:", len(df))


# 10. Unique values
print("\n8. Unique Values")

for column in df.columns:
    print(column, ":", df[column].nunique())


# 11. Numerical statistics
print("\n9. Numerical Statistics")
print(df.describe())


# 12. Match score
print("\n10. Match Score")

print("Minimum:", df["matched_score"].min())
print("Maximum:", df["matched_score"].max())
print("Average:", df["matched_score"].mean())


# 13. Top job positions
print("\n11. Top Job Positions")

print(
    df["job_position_name"]
    .value_counts()
    .head(10)
)


# 14. Education
print("\n12. Top Education")

print(
    df["degree_names"]
    .value_counts()
    .head(10)
)


# 15. Candidate skills
print("\n13. Candidate Skills")
print(df["skills"].head(5))


# 16. Required job skills
print("\n14. Required Job Skills")
print(df["skills_required"].head(5))


# Final summary
print("\n" + "=" * 40)
print("FINAL SUMMARY")
print("=" * 40)

print("Original dataset file: resume_data_for_ranking.csv")
print("Rows after preprocessing:", len(df))
print("No new dataset file was created.")