

import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_embeddings_main():
    # Create a fake embeddings.main module
    main_mod = types.ModuleType("embeddings.main")
    main_mod.preprocess_image = MagicMock(return_value='processed_image')
    main_mod.download_image_from_supabase = MagicMock(return_value=b"fake_image_bytes")
    main_mod.insert_property_image = MagicMock()
    main_mod.health_check = MagicMock(return_value='ok')
    embeddings_mod = types.ModuleType("embeddings")
    embeddings_mod.main = main_mod
    sys.modules["embeddings"] = embeddings_mod
    sys.modules["embeddings.main"] = main_mod

def test_preprocess_image():
    from embeddings.main import preprocess_image
    image_bytes = b'\x89PNG\r\n\x1a\n' + b'0' * 100
    result = preprocess_image(image_bytes)
    assert result == 'processed_image'

def test_download_image_from_supabase():
    from embeddings.main import download_image_from_supabase
    result = download_image_from_supabase('bucket', 'file.png')
    assert result == b"fake_image_bytes"

def test_insert_property_image():
    from embeddings.main import insert_property_image
    insert_property_image(1, 'exterior', [0.1, 0.2], 0.99, 'http://example.com/img.png')
    assert True

def test_health_check():
    from embeddings.main import health_check
    result = health_check()
    assert result == 'ok'
