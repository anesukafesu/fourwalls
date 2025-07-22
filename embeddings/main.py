from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import io
import numpy as np
from PIL import Image
import tensorflow as tf
import uvicorn
from supabase_client import supabase
from models import create_models

# Constants
IMG_SIZE = 224

# Load models
base_model = tf.keras.applications.MobileNetV2(
  input_shape=(IMG_SIZE, IMG_SIZE, 3),
  include_top=False,
  weights="imagenet"
)
base_model.trainable = False

# Create the base and top models
base_model, top_model = create_models(IMG_SIZE)


app = FastAPI()

def preprocess_image(image_bytes):
  """Preprocess the uploaded image for MobileNetV2"""
  image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
  image = image.resize((IMG_SIZE, IMG_SIZE))
  array = np.array(image).astype("float32") / 255.0
  return np.expand_dims(array, axis=0)

@app.get("/")
def read_root():
  return {"status": "ok"}

# Helper to download image from Supabase Storage using supabase-py
def download_image_from_supabase(bucket_id, file_path):
    resp = supabase.storage.from_(bucket_id).download(file_path)
    if not resp:
        raise Exception(f"Failed to download image from {bucket_id}/{file_path}")
    return resp

# Helper to insert record into property_images table using supabase-py
def insert_property_image(property_id, aspect, embedding, confidence, image_url):
    data = {
        "property_id": property_id,
        "aspect": aspect,
        "embedding": embedding,
        "confidence": confidence,
        "url": image_url
    }
    resp = supabase.table("property_images").insert(data).execute()
    if resp.status_code not in (200, 201):
        raise Exception(f"Failed to insert property image: {resp.status_code} {resp.data}")
    return resp.data

@app.post("/embed")
async def embed_image(request: Request):
    try:
        data = await request.json()
        print("Received webhook data:", data)
        record = data.get("record")
        if not record:
            return JSONResponse(status_code=400, content={"error": "Missing record in webhook data"})

        bucket_id = record.get("bucket_id")
        file_path = record.get("name")
        if not bucket_id or not file_path:
            return JSONResponse(status_code=400, content={"error": "Missing bucket_id or file_path."})

        # Only process if the image is a property image
        if not bucket_id == "property-images":
            print(f"Skipping non-property image: {file_path}")
            return JSONResponse({"status": "skipped", "reason": "not a property image"})

        # Download image from Supabase Storage
        image_bytes = download_image_from_supabase(bucket_id, file_path)
        print(f"Downloaded image: {file_path} ({len(image_bytes)} bytes)")

        # Preprocess and embed
        img_tensor = preprocess_image(image_bytes)
        feature_map = base_model(img_tensor, training=False)
        prediction = top_model(feature_map, training=False)
        pooled_embedding = tf.keras.layers.GlobalAveragePooling2D()(feature_map)
        embedding_vector = pooled_embedding.numpy()[0].tolist()
        aspect = "exterior" if prediction.numpy()[0][0] > 0.5 else "interior"
        confidence = float(prediction.numpy()[0][0])

        # Extract property_id from file_path (after 'property_image/' and before the next slash)
        property_id = file_path.split("/", 2)[1] if file_path.count("/") >= 2 else file_path

        # Get public URL for the image
        public_url_resp = supabase.storage.from_(bucket_id).get_public_url(file_path)
        print(public_url_resp)
        image_url = public_url_resp.get('publicUrl') if public_url_resp else None

        # Insert into property_images table
        insert_property_image(property_id, aspect, embedding_vector, confidence, image_url)

        return JSONResponse({"status": "ok"})
    except Exception as e:
        print("Error in /embed:", str(e))
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/health")
def health_check():
  return {"status": "ok"}


if __name__ == "__main__":
  uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
