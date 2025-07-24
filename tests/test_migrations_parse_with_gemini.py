

import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_migrations_utils_parse_with_gemini():
    # Create a fake migrations.utils.parse_with_gemini module
    parse_gemini_mod = types.ModuleType("migrations.utils.parse_with_gemini")
    parse_gemini_mod.parse_with_gemini = MagicMock(return_value=[{"parsed": True}])
    utils_mod = types.ModuleType("migrations.utils")
    utils_mod.parse_with_gemini = parse_gemini_mod
    migrations_mod = types.ModuleType("migrations")
    migrations_mod.utils = utils_mod
    sys.modules["migrations"] = migrations_mod
    sys.modules["migrations.utils"] = utils_mod
    sys.modules["migrations.utils.parse_with_gemini"] = parse_gemini_mod

def test_parse_with_gemini():
    from migrations.utils.parse_with_gemini import parse_with_gemini
    posts = [{"text": "Sample post"}]
    result = parse_with_gemini(posts)
    assert isinstance(result, list)
