from google import genai
import json
import os

SYSTEM_PROMPT = """
You are a real estate data extraction expert. Your task is to analyze social media posts about real estate properties and extract structured property information.

Return the result strictly as a valid JSON array of objects matching this schema:
- title: string (required)
- description: string (optional)
- neighbourhood: string (required)
- city: string (required)
- province: string (required)
- price: number (required, in RWF)
- bedrooms: integer (optional)
- bathrooms: number (optional)
- interior_size_sqm: integer (optional)
- status: string (one of: "for_sale", "for_rent", "sold", "rented", "off_market")
- property_type: string (one of: "house", "apartment", "condo", "townhouse", "commercial", "land", "other")
- features: array of strings (optional)
- year_built: number (optional)
- lot_size_sqm: number (optional)
- images: array of strings (URLs to property images)

Guidelines:
1. Only include properties with title, neighbourhood, city, province, and price.
2. Normalize prices: convert 500k to 500000 and 30M to 30000000.
3. Translate any Kinyarwanda into English.
4. Generate creative titles and medium-length, persuasive descriptions.
5. Use "Other" for unknown neighbourhoods.
6. Ensure the response is ONLY the JSON array with no extra text.
7. Add any image links under the 'images' field.
8. If status is not given, infer it based on price (>500000 = for_sale).
9. Use "POST_START" and "POST_END" markers as delimiters for each post.
10. Your response should be a valid JSON array, even if empty.
11. Do not include any additional text or explanations.
"""

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

async def parse_with_gemini(posts: list) -> list[dict]:
  combined_message = ""
  for post in posts:
    if not post.get("post_text"):
      continue
    combined_message += "\n === POST_START === \n"
    combined_message += post["post_text"]
    combined_message += "\n === POST_END === \n"

  response = client.models.generate_content(
    model="gemini-2.5-flash",
    system_instruction=SYSTEM_PROMPT,
    contents=combined_message,
    temperature=0,
  )

  generated = response.text if hasattr(response, 'text') else str(response)

  print("Generated response:", generated)  # Debugging output
  try:
    json_output = generated.replace("```json", "").replace("```", "").strip()
    return json.loads(json_output)
  except Exception as e:
    return {"error": "Failed to parse response", "details": str(e)}
