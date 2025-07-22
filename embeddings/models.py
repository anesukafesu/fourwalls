import tensorflow as tf


def create_models(IMG_SIZE):
  """Create and return the base and top models"""
  base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights="imagenet"
  )
  base_model.trainable = False

  top_model = tf.keras.models.load_model("model/top_classifier_head.h5")
  
  return base_model, top_model