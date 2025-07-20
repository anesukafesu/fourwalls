from fastapi import Request, HTTPException, Header
from utils.supabase import supabase, upload_properties
from utils.parse_with_gemini import parse_with_gemini

async def parse(request: Request, authorization: str = Header(...)):
  body = await request.json()
  post_ids = body.get("post_ids")

  if not post_ids or not isinstance(post_ids, list):
    raise HTTPException(status_code=400, detail="post_ids array is required")

  if not authorization.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="Invalid authorization header format")
  token = authorization.split("Bearer ")[-1].strip()

  user_response = supabase.auth.get_user(token)
  user = getattr(user_response, "user", None)
  if not user:
    raise HTTPException(status_code=401, detail="Unauthorized")

  user_id = user.id

  try:
    response = (
      supabase.table("listings_buffer")
      .select("*")
      .in_("id", post_ids)
      .eq("user_id", user_id)
      .execute()
    )
    posts = response.data
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to fetch posts: {str(e)}")

  if not posts:
    raise HTTPException(status_code=404, detail="No posts found for the given IDs")

  properties = parse_with_gemini(posts)

  try:
    properties_response = await upload_properties(properties, user_id)
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to upload properties: {str(e)}")

  if "error" in properties_response:
    raise HTTPException(status_code=500, detail=properties_response["error"])

  return {"properties": properties_response}
