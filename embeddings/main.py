from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import uvicorn

# Constants
IMG_SIZE = 224

# Load models
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights="imagenet"
)
base_model.trainable = False

# The top model includes GlobalAveragePooling2D as the first layer
top_model = tf.keras.models.load_model("model/top_classifier_head.h5")

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


@app.post("/embed")
async def embed_image(file: UploadFile = File(...)):
    try:
        # Load and preprocess the image
        contents = await file.read()
        img_tensor = preprocess_image(contents)

        # Extract visual features
        # shape: (1, 7, 7, 1280)
        feature_map = base_model(img_tensor, training=False)

        # Generate classification and embedding
        # top_model includes GlobalAveragePooling2D
        prediction = top_model(feature_map, training=False)
        pooled_embedding = tf.keras.layers.GlobalAveragePooling2D()(feature_map)
        embedding_vector = pooled_embedding.numpy()[0].tolist()

        label = "exterior" if prediction.numpy()[0][0] > 0.5 else "interior"
        confidence = float(prediction.numpy()[0][0])

        return JSONResponse({
            "embedding": embedding_vector,
            "predicted_label": label,
            "confidence": confidence
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
