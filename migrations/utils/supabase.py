from datetime import datetime
import os
import requests
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
BUCKET_NAME = "property_images"

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
  raise Exception("Missing Supabase credentials in environment variables")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def upload_image_to_bucket(image_data: bytes, storage_path: str) -> str:
  try:
    # Upload the file to storage
    supabase.storage.from_(BUCKET_NAME).upload(
      path=storage_path,
      file=image_data,
      file_options={"content-type": "image/jpeg"},
      upsert=True
    )
    # Build the public URL
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)
    return public_url
  except Exception as e:
    print("Failed to upload image:", str(e))
    return None

def parse_price(price_str):
  try:
    price_str = price_str.lower().replace(",", "").replace("rwf", "")
    multiplier = 1
    if "k" in price_str:
      multiplier = 1000
      price_str = price_str.replace("k", "")
    elif "m" in price_str:
      multiplier = 1000000
      price_str = price_str.replace("m", "")
    return int(float(price_str) * multiplier)
  except:
    return 0

def infer_status(price, status):
  return status or ("for_sale" if price > 500000 else "for_rent")

async def upload_properties(properties, user_id):
  neighbourhoods = supabase.table("neighbourhoods").select("id, name").execute().get("data", [])
  neighbourhood_map = {n["name"].lower(): n["id"] for n in neighbourhoods}

  formatted_properties = []
  for prop in properties:
    if not all(k in prop for k in ["title", "neighbourhood", "city", "price"]):
      continue

    price = parse_price(str(prop["price"]))
    status = infer_status(price, prop.get("status"))
    neighbourhood_id = neighbourhood_map.get(prop.get("neighbourhood", "").lower(), neighbourhood_map.get("other"))

    formatted_properties.append({
      **prop,
      "price": price,
      "status": status,
      "neighbourhood": neighbourhood_id,
      "agent_id": user_id,
      "images": [],
      "created_at": datetime.utcnow().isoformat(),
    })
  
  print("Formatted properties for upload:", formatted_properties)  # Debugging output

  insert_resp = supabase.table("properties").insert(formatted_properties).execute()
  inserted = insert_resp.get("data", [])
  if not inserted:
    return {"error": "Failed to insert properties", "details": insert_resp.get("error")}

  for prop in inserted:
    image_urls = []
    for url in prop.get("images", []):
      try:
        res = requests.get(url)
        if res.status_code == 200:
          image_data = res.content
          path = f"{prop['id']}/{os.path.basename(url)}"
          supa_url = upload_image_to_bucket(image_data, path)
          if supa_url:
            image_urls.append(supa_url)
      except Exception as e:
        print(f"Image upload failed: {e}")

    supabase.table("properties").update({
      "images": image_urls
    }).eq("id", prop["id"]).execute()

  return {
    "success": True,
    "properties_added": len(inserted)
  }
