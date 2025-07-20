from fastapi import Header, HTTPException
from typing import Dict
from datetime import datetime, timedelta
import time
import requests
from utils.supabase import supabase
from utils.facebook import classify_as_housing, extract_image_urls
import os

def migrate_facebook_posts(payload: Dict[str, str], authorization: str = Header(...)):
  code = payload.get("code")
  redirect_uri = payload.get("redirect_uri")

  if not code:
    raise HTTPException(status_code=400, detail="Code is required")
  if not redirect_uri:
    raise HTTPException(status_code=400, detail="Redirect URI is required")

  facebook_app_id = os.getenv("FACEBOOK_APP_ID")
  facebook_app_secret = os.getenv("FACEBOOK_APP_SECRET")

  if not facebook_app_id or not facebook_app_secret:
    raise HTTPException(status_code=500, detail="Facebook App credentials not configured")

  token_url = f"https://graph.facebook.com/v18.0/oauth/access_token"
  params = {
    "client_id": facebook_app_id,
    "redirect_uri": redirect_uri,
    "client_secret": facebook_app_secret,
    "code": code,
  }
  
  token_response = requests.get(token_url, params=params)
  token_data = token_response.json()

  if "error" in token_data:
    raise HTTPException(status_code=400, detail=token_data["error"])
  
  print(f"Authorization: {authorization}")

  access_token = token_data["access_token"]
  user_response = supabase.auth.get_user(authorization)
  user = user_response.user if hasattr(user_response, 'user') else None

  if not user:
    raise HTTPException(status_code=401, detail="Unauthorized")

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

    if listings_to_insert:
      insert_resp = supabase.table("listings_buffer").insert(listings_to_insert).execute()
      if insert_resp.get("error"):
        raise HTTPException(status_code=500, detail=insert_resp["error"])

        return {
          "success": True,
          "message": f"Processed {len(all_posts)} posts, found {len(housing_posts)} housing-related posts",
          "total_posts": len(all_posts),
          "housing_posts": len(housing_posts),
          "posts_saved": len(listings_to_insert),
        }
    else:
      return {
        "success": True,
        "message": f"Processed {len(all_posts)} posts, but found no housing-related content",
        "total_posts": len(all_posts),
        "housing_posts": 0,
        "posts_saved": 0,
      }
