from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def get_similarity(candidate_text, job_text):

    candidate_text = str(candidate_text or "")
    job_text = str(job_text or "")

    if not candidate_text.strip() or not job_text.strip():
        return 0.0

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    vectors = vectorizer.fit_transform([
        candidate_text,
        job_text
    ])

    similarity = cosine_similarity(
        vectors[0:1],
        vectors[1:2]
    )[0][0]

    return max(
        0.0,
        min(1.0, float(similarity))
    )
    