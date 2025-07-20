from typing import List, Dict

def classify_as_housing(message: str) -> bool:
  if not message:
    return False

  housing_keywords = [
    "house", "home", "property", "real estate", "for sale", "for rent",
    "bedroom", "bathroom", "kitchen", "garage", "yard", "apartment", "condo",
    "listing", "price", "sqft", "square feet", "mortgage", "lease", "rental",
    "landlord", "tenant", "utilities", "furnished", "unfurnished", "deposit",
    "realtor", "agent", "viewing", "tour"
  ]

  lower_message = message.lower()
  return any(keyword in lower_message for keyword in housing_keywords)


def extract_image_urls(post: Dict) -> List[str]:
  images = []

  if "full_picture" in post and post["full_picture"]:
    images.append(post["full_picture"])

  attachments = post.get("attachments", {}).get("data", [])
  for attachment in attachments:
    media = attachment.get("media", {}).get("image", {})
    if media.get("src"):
      images.append(media["src"])

    subattachments = attachment.get("subattachments", {}).get("data", [])
    for subattachment in subattachments:
      sub_media = subattachment.get("media", {}).get("image", {})
      if sub_media.get("src"):
        images.append(sub_media["src"])

  return list(set(images))  # Ensure uniqueness
