from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def get_similarity(candidate_text, job_text):
    candidate_embedding = model.encode(
        candidate_text,
        convert_to_numpy=True
    )

    job_embedding = model.encode(
        job_text,
        convert_to_numpy=True
    )

    similarity = cosine_similarity(
        [candidate_embedding],
        [job_embedding]
    )[0][0]

    return max(0.0, min(1.0, float(similarity)))