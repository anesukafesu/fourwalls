
import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_embeddings_models():
    # Create a fake embeddings.models module
    models_mod = types.ModuleType("embeddings.models")
    models_mod.create_models = MagicMock(return_value='mock_model')
    embeddings_mod = types.ModuleType("embeddings")
    embeddings_mod.models = models_mod
    sys.modules["embeddings"] = embeddings_mod
    sys.modules["embeddings.models"] = models_mod

def test_create_models():
    from embeddings.models import create_models
    IMG_SIZE = (224, 224)
    model = create_models(IMG_SIZE)
    assert model == 'mock_model'
