from google import genai
from google.genai import types
import json
import os

SYSTEM_PROMPT = """
You are a real estate data extraction expert. Your task is to analyse social media posts about real estate properties and extract structured property information.

Return the result strictly as a valid JSON array of objects matching this schema:

- title: string (required)
- description: string (optional)
- neighbourhood: string (required)
- city: string (required)
- price: number (required, in RWF)
- bedrooms: integer (optional)
- bathrooms: number (optional)
- interior_size_sqm: integer (optional)
- status: string (one of: "for_sale", "for_rent", "sold", "rented", "off_market")
- property_type: string (one of: "house", "apartment", "condo", "townhouse", "commercial", "land", "other")
- features: array of strings (optional)
- year_built: number (optional)
- lot_size_sqm: number (optional)
- images: array of image URLs (optional)
- facebook_import_id: string (required)

Guidelines:
1. Only include properties with title, neighbourhood, city, and price.
2. Normalise prices: convert formats like “500k” to 500000 and “30M” to 30000000.
3. Translate any Kinyarwanda into English.
4. Generate creative titles and medium-length, persuasive descriptions.
5. Use "Other" for unknown neighbourhoods.
6. If no status is given, infer it based on price: if above 500000 → "for_sale", otherwise → "for_rent".
7. Your response should only be a valid JSON array, even if empty.
8. Do not include any extra explanations, text, or commentary.
9. Use POST_START and POST_END as delimiters for each post.
10. Add any image links under the 'images' field.
11. Each object must include "facebook_import_id" from the original post.
---

Here are some examples to guide you:

Input:
=== POST_START ===
Facebook Import ID: fb_post_001
Selling a lovely 3 bedroom house in Kabeza, Kigali. Spacious compound, indoor kitchen, tiled floors. Going for 65M. DM for more details. 
#HouseForSale
=== POST_END ===

Output:
[
  {
    "title": "Charming 3-Bedroom Home for Sale in Kabeza",
    "description": "This spacious 3-bedroom house in Kabeza features tiled floors, an indoor kitchen, and a large compound perfect for families.",
    "neighbourhood": "Kabeza",
    "city": "Kigali",
    "price": 65000000,
    "bedrooms": 3,
    "status": "for_sale",
    "property_type": "house",
    "features": ["indoor kitchen", "tiled floors", "spacious compound"],
    "facebook_import_id": "fb_post_001"
  }
]

---

Input:
=== POST_START ===
Facebook Import ID: fb_post_002
Igihe cyiza cyo gukodesha! Inzu iri Kimironko, iburiro rinini, douche ya moderne. Price: 400k/month. Wambaza kuri inbox.
=== POST_END ===

Output:
[
  {
    "title": "Modern House for Rent in Kimironko",
    "description": "Enjoy modern comfort in this spacious rental house in Kimironko, featuring a large dining area and a contemporary bathroom.",
    "neighbourhood": "Kimironko",
    "city": "Kigali",
    "price": 400000,
    "status": "for_rent",
    "property_type": "house",
    "features": ["modern bathroom", "large dining area"],
    "facebook_import_id": "fb_post_002"
  }
]

---

Input:
=== POST_START ===
Facebook Import ID: fb_post_003
Prime land in Nyarutarama – 1200 sqm. Ideal for luxury apartments or villas. Selling for 120M Rwf. Contact us now!
=== POST_END ===

Output:
[
  {
    "title": "Prime 1200 sqm Plot for Sale in Nyarutarama",
    "description": "Excellent opportunity to own 1200 square metres of land in the prestigious Nyarutarama area. Perfect for building luxury apartments or villas.",
    "neighbourhood": "Nyarutarama",
    "city": "Kigali",
    "price": 120000000,
    "status": "for_sale",
    "property_type": "land",
    "lot_size_sqm": 1200,
    "features": ["ideal for luxury development"],
    "facebook_import_id": "fb_post_003"
  }
]
"""

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

async def parse_with_gemini(posts: list) -> list[dict]:
  combined_message = ""
  for post in posts:
    if not post.get("post_text"):
      continue
    combined_message += "\n === POST_START === \n"
    combined_message += "Facebook Import ID: " + post["post_id"] + "\n"
    combined_message += post["post_text"]
    combined_message += "\n === POST_END === \n"

  response = client.models.generate_content(
    model="gemini-2.5-flash",
    config=types.GenerateContentConfig(
      system_instruction=SYSTEM_PROMPT
    ),
    contents=combined_message,
  )

  generated = response.text if hasattr(response, 'text') else str(response)
  try:
    json_output = generated.replace("```json", "").replace("```", "").strip()
    return json.loads(json_output)
  except Exception as e:
    return {"error": "Failed to parse response", "details": str(e)}
