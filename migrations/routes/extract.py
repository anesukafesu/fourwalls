from fastapi import Request, HTTPException
from utils.supabase import supabase
from utils.gemini import process_posts_with_gemini

async def extract(request: Request):
  body = await request.json()
  post_ids = body.get("post_ids")
  user_id = body.get("user_id")

  if not post_ids or not isinstance(post_ids, list):
    raise HTTPException(status_code=400, detail="post_ids array is required")

  posts_response = supabase.table("listings_buffer").select("*").in("id", post_ids).eq("user_id", user_id).execute()
  if posts_response.get("error"):
    raise HTTPException(status_code=500, detail=posts_response["error"])

  posts = posts_response.get("data", [])
  if not posts:
    raise HTTPException(status_code=404, detail="No posts found for the given IDs")

  return await process_posts_with_gemini(posts, user_id)
