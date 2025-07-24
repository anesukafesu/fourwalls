from embeddings.models import create_models

def test_create_models():
    IMG_SIZE = (224, 224)
    model = create_models(IMG_SIZE)
    assert model is not None
