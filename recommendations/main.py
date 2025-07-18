from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
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
    # "neighbourhood": 0.8,
    "status": 3,
}

aspect_weights = {
    "metadata": 0.4,
    "interior": 0.3,
    "exterior": 0.2,
    "yard": 0.1
}

max_images = {"interior": 10, "exterior": 5, "yard": 3}

# Internal state
engine = RecommendationEngine(
    metadata_weights, max_images, aspect_weights, top_k=10)


class ViewHistoryRequest(BaseModel):
    viewed_ids: List[str]


def load_embeddings():
    properties = supabase.table("properties").select(
        "id,bedrooms,bathrooms,price,status,neighbourhood,interior_size_sqm"
    ).execute().data

    images = supabase.table("property_images").select(
        "property_id,aspect,embedding").execute().data

    grouped = defaultdict(lambda: defaultdict(list))
    for img in images:
        grouped[img["property_id"]][img["aspect"]].append(
            np.array(img["embedding"], dtype=np.float32))

    embeddings = {}
    for prop in properties:
        pid = prop["id"]
        metadata = {k: v for k, v in prop.items() if k != "id"}
        metadata["status"] = 0 if metadata["status"] == "for_rent" else 1
        prop_data = {
            "metadata": metadata,
            "images": {
                "interior": grouped[pid].get("interior", []),
                "exterior": grouped[pid].get("exterior", []),
                "yard": grouped[pid].get("yard", [])
            }
        }
        embeddings[pid] = PropertyEmbedding.from_property(
            prop_data, max_images, metadata_weights)

    engine.embeddings = embeddings
    engine.build_similarity_index()


@app.on_event("startup")
def startup_event():
    load_embeddings()


@app.get("/recommendations/{property_id}")
def get_similar(property_id: str):
    try:
        recommendations = engine.get_recommendations(property_id)
        return {"recommended_ids": [rec[1] for rec in recommendations]}
    except KeyError:
        raise HTTPException(404, detail="Property not found")


@app.post("/recommendations/from-history")
def get_from_history(req: ViewHistoryRequest):
    all_recs = []
    seen = set()
    for i, pid in enumerate(reversed(req.viewed_ids)):
        weight = 1 / (i + 1)
        for score, rec_id in engine.get_recommendations(pid):
            if rec_id not in req.viewed_ids:
                all_recs.append((score * weight, rec_id))

    # Aggregate and sort
    score_map = defaultdict(float)
    for score, rid in all_recs:
        score_map[rid] += score

    sorted_recs = sorted(
        score_map.items(), key=lambda x: x[1], reverse=True)[:10]
    return {"recommended_ids": [r[0] for r in sorted_recs]}


@app.post("/add-property/{property_id}")
def add_property(property_id: str):
    prop = supabase.table("properties").select(
        "id,bedrooms,bathrooms,price,status,neighbourhood,interior_size_sqm"
    ).eq("id", property_id).single().execute().data
    if not prop:
        raise HTTPException(404, detail="Property not found")

    imgs = supabase.table("property_images").select(
        "property_id,aspect,embedding").eq("property_id", property_id).execute().data
    grouped = defaultdict(list)
    for img in imgs:
        grouped[img["aspect"]].append(
            np.array(img["embedding"], dtype=np.float32))

    metadata = {k: v for k, v in prop.items() if k != "id"}
    prop_data = {
        "metadata": metadata,
        "images": {
            "interior": grouped.get("interior", []),
            "exterior": grouped.get("exterior", []),
            "yard": grouped.get("yard", [])
        }
    }
    engine.embeddings[property_id] = PropertyEmbedding.from_property(
        prop_data, max_images, metadata_weights)
    engine.build_similarity_index()
    return {"status": "property added"}


@app.delete("/delete-property/{property_id}")
def delete_property(property_id: str):
    if property_id in engine.embeddings:
        del engine.embeddings[property_id]
        engine.build_similarity_index()
        return {"status": "property deleted"}
    else:
        raise HTTPException(404, detail="Property not found in memory")


if __name__ == "__main__":
    uvicorn.run('main:app', host="0.0.0.0", port=7860, reload=True)
