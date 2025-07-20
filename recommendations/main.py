from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
import numpy as np
from collections import defaultdict
from supabase import create_client
from recommendation_engine import RecommendationEngine
from property_embedding import PropertyEmbedding
import uvicorn

if os.getenv("ENV") != "production":
  load_dotenv(dotenv_path=os.path.join(
    os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
app = FastAPI()

# Config
metadata_weights = {
  "bedrooms": 1.0,
  "bathrooms": 1.0,
  "price": 1.5,
  "interior_size_sqm": 1.2,
  "status": 3,
}

aspect_weights = {
  "metadata": 0.4,
  "interior": 0.3,
  "exterior": 0.2,
  "neighbourhood": 0.1
}

max_images = {"interior": 10, "exterior": 5 }

# Internal state
engine = RecommendationEngine(
  metadata_weights, max_images, aspect_weights, top_k=10
)


class ViewHistoryRequest(BaseModel):
  viewed_ids: List[str]


def load_embeddings():
  property_fields = "id,bedrooms,bathrooms,price,status,neighbourhood,interior_size_sqm"
  properties = supabase.table("properties").select(property_fields).execute().data

  property_image_fields = "property_id,aspect,embedding"
  images = supabase.table("property_images").select(property_image_fields).execute().data

  neighbourhood_fields = "id,embeddings"
  neighbourhoods = supabase.table("neighbourhoods").select(neighbourhood_fields).execute().data

  neighbhourhoods_map = {
    n["id"]: np.array(n["embeddings"], dtype=np.float32) for n in neighbourhoods
  }

  grouped = defaultdict(lambda: defaultdict(list))
  for img in images:
    grouped[img["property_id"]][img["aspect"]].append(
      np.array(img["embedding"], dtype=np.float32))

  embeddings = {}
  for prop in properties:
    pid = prop["id"]
    metadata = {k: v for k, v in prop.items() if not k in ["id", "neighbourhood"]}

    if metadata["status"] == "for_rent":
      metadata["status"] = 0
    elif metadata["status"] == "for_sale":
      metadata["status"] = 1
    else:
      # Ignore properties that are not for rent or sale
      continue

    prop_data = {
      "metadata": metadata,
      "images": {
        "interior": grouped[pid].get("interior", []),
        "exterior": grouped[pid].get("exterior", []),
      },
      "neighbourhood": neighbhourhoods_map.get(prop["neighbourhood"], None)
    }

    embeddings[pid] = PropertyEmbedding.from_property(prop_data, max_images, metadata_weights)

  engine.embeddings = embeddings
  engine.build_similarity_index()


@app.on_event("startup")
def startup_event():
  load_embeddings()

@app.get("/")
def root():
  return {"message": "API is live!"}

@app.get("/recommendations/{property_id}")
def get_similar(property_id: str):
  try:
    recommendations = engine.get_recommendations(property_id)
    return {"recommended_ids": [rec[0] for rec in recommendations]}
  except KeyError:
    raise HTTPException(404, detail="Property not found")


@app.post("/recommendations/from-history")
def get_from_history(req: ViewHistoryRequest):
  all_recs = []
  for i, pid in enumerate(reversed(req.viewed_ids)):
    weight = 1 / (i + 1)
    for score, rec_id in engine.get_recommendations(pid):
      if rec_id not in req.viewed_ids:
        all_recs.append((score * weight, rec_id))

  # Aggregate and sort
  score_map = defaultdict(float)
  for score, rid in all_recs:
    score_map[rid] += score

  sorted_recs = sorted(score_map.items(), key=lambda x: x[0], reverse=True)[:10]
  return {"recommended_ids": [r[0] for r in sorted_recs]}

@app.get("/on-properties-update/")
def add_property():
  load_embeddings()


if __name__ == "__main__":
    uvicorn.run('main:app', host="0.0.0.0", port=7860, reload=True)
