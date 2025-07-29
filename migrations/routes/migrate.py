from fastapi import Header, HTTPException
from typing import Dict
from datetime import datetime, timedelta
import time
import requests
import os
from utils.supabase import supabase
from utils.facebook import classify_as_housing, extract_image_urls


def migrate_facebook_posts(payload: Dict[str, str], authorization: str = Header(...)):
  code = payload.get("code")
  redirect_uri = payload.get("redirect_uri")

  if not code:
    print("Code is required")
    raise HTTPException(status_code=400, detail="Code is required")
  if not redirect_uri:
    print("Redirect URI is required")
    raise HTTPException(status_code=400, detail="Redirect URI is required")

  facebook_app_id = os.getenv("FACEBOOK_APP_ID")
  facebook_app_secret = os.getenv("FACEBOOK_APP_SECRET")

  if not facebook_app_id or not facebook_app_secret:
    raise HTTPException(status_code=500, detail="Facebook App credentials not configured")

  # Exchange Facebook code for access token
  token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
  params = {
    "client_id": facebook_app_id,
    "redirect_uri": redirect_uri,
    "client_secret": facebook_app_secret,
    "code": code,
  }

  token_response = requests.get(token_url, params=params)
  token_data = token_response.json()

  if "error" in token_data:
    print(f"Error fetching access token: {token_data['error']}")
    raise HTTPException(status_code=400, detail=token_data["error"])

  # Extract Bearer token
  if not authorization.startswith("Bearer "):
    print("Invalid authorization header format")
    raise HTTPException(status_code=401, detail="Invalid authorization header format")
  token = authorization.split("Bearer ")[-1].strip()

  user_response = supabase.auth.get_user(token)
  user = getattr(user_response, "user", None)
  if not user:
    raise HTTPException(status_code=401, detail="Unauthorized")

  access_token = token_data["access_token"]
  since_timestamp = int((datetime.utcnow() - timedelta(days=365)).timestamp())
  all_posts = []

  next_url = (
    f"https://graph.facebook.com/v18.0/me/posts"
    f"?fields=id,message,created_time,full_picture,attachments{{media,subattachments}}"
    f"&since={since_timestamp}&limit=25&access_token={access_token}"
  )

  while next_url:
    posts_response = requests.get(next_url)
    posts_data = posts_response.json()
    if "error" in posts_data:
      break
    all_posts.extend(posts_data.get("data", []))
    next_url = posts_data.get("paging", {}).get("next")
    time.sleep(0.1)

  housing_posts = [p for p in all_posts if classify_as_housing(p.get("message", ""))]

  listings_to_insert = [
    {
      "user_id": user.id,
      "post_id": post["id"],
      "post_text": post.get("message"),
      "image_urls": extract_image_urls(post),
      "source_url": f"https://facebook.com/{post['id']}",
      "extracted_at": datetime.utcnow().isoformat(),
    }
    for post in housing_posts
  ]

  inserted_count = 0
  error_details = None

  if listings_to_insert:
    try:
      response = supabase.table("listings_buffer").insert(listings_to_insert).execute()
      inserted_count = len(response.get("data", []))
    except Exception as e:
      error_details = str(e)

  return {
    "success": True,
    "message": f"Processed {len(all_posts)} posts, found {len(housing_posts)} housing-related posts",
    "total_posts": len(all_posts),
    "housing_posts": len(housing_posts),
    "posts_saved": inserted_count,
    "insert_error": error_details,
  }
