from fastapi import Request, HTTPException, Header
from utils.supabase import supabase, upload_properties
from utils.parse_with_gemini import parse_with_gemini

async def parse(request: Request, authorization: str = Header(...)):
  body = await request.json()
  post_ids = body.get("post_ids")

  if not post_ids or not isinstance(post_ids, list):
    raise HTTPException(status_code=400, detail="post_ids array is required")

  token = authorization.replace("Bearer ", "")
  user_response = supabase.auth.get_user(token)
  user = user_response.user if hasattr(user_response, 'user') else None

  if not user:
    raise HTTPException(status_code=401, detail="Invalid or expired session")

  user_id = user.id

  posts_response = supabase.table("listings_buffer").select("*").in_("id", post_ids).eq("user_id", user_id).execute()
  if posts_response.get("error"):
    raise HTTPException(status_code=500, detail=posts_response["error"])

  posts = posts_response.get("data", [])
  if not posts:
    raise HTTPException(status_code=404, detail="No posts found for the given IDs")

  properties = parse_with_gemini(posts, user_id)

  properties_response = await upload_properties(properties, user_id)
  if "error" in properties_response:
    raise HTTPException(status_code=500, detail=properties_response["error"])
  return {"properties": properties_response}

