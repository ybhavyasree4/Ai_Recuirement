import pandas as pd
import joblib

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

# Load test data
test_data = pd.read_csv("test_data.csv")

print("Test data loaded!")
print("Test samples:", len(test_data))

# Input and actual match score
X_test = test_data["text"]
y_test = test_data["matched_score"]

# Load trained model
model = joblib.load("model.pkl")

# Load TF-IDF vectorizer
vectorizer = joblib.load("vectorizer.pkl")

print("Model loaded!")
print("Vectorizer loaded!")

# Convert test text to TF-IDF
X_test_tfidf = vectorizer.transform(X_test)

# Predict match scores
predictions = model.predict(X_test_tfidf)

# Calculate evaluation metrics
mae = mean_absolute_error(y_test, predictions)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

# Display results
print("\nModel Testing")
print("-----------------------")
print("MAE:", round(mae, 4))
print("MSE:", round(mse, 4))
print("R2 Score:", round(r2, 4))

print("\nTesting completed successfully!")