from typing import List, Dict
import joblib
import os

# Load the trained classifier model once at startup
MODEL_PATH = "real_estate_classifier.pkl"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Trained model not found at {MODEL_PATH}. Please train and save the model first.")

# Load model data
model_data = joblib.load(MODEL_PATH)
vectorizer = model_data['vectorizer']
classifier = model_data['classifier']

def classify_as_housing(message: str) -> bool:
    """
    Use the trained RealEstateClassifier model to determine
    if a given message is about real estate.
    """
    if not message or not message.strip():
        return False

    # Preprocess here in the same way as the training pipeline
    processed_message = message.lower()
    processed_message = processed_message.replace("\n", " ")
    
    # Remove punctuation except for slashes (like "3/4 bedrooms")
    import re
    processed_message = re.sub(r'[^\w\s/]', ' ', processed_message)
    processed_message = re.sub(r'\s+', ' ', processed_message).strip()

    # Vectorize and predict
    text_vectorized = vectorizer.transform([processed_message])
    prediction = classifier.predict(text_vectorized)[0]

    # In training: 1 = Real Estate, 0 = Other Post
    return prediction == 1


def extract_image_urls(post: Dict) -> List[str]:
    """
    Extract all unique image URLs from a Facebook post dictionary.
    """
    images = []

    # Single main picture
    if "full_picture" in post and post["full_picture"]:
        images.append(post["full_picture"])

    # Attachments
    attachments = post.get("attachments", {}).get("data", [])
    for attachment in attachments:
        media = attachment.get("media", {}).get("image", {})
        if media.get("src"):
            images.append(media["src"])

        # Subattachments
        subattachments = attachment.get("subattachments", {}).get("data", [])
        for subattachment in subattachments:
            sub_media = subattachment.get("media", {}).get("image", {})
            if sub_media.get("src"):
                images.append(sub_media["src"])

    # Remove duplicates
    return list(set(images))
