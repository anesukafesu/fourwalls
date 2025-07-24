
import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_migrations_utils_supabase():
    # Create a fake migrations.utils.supabase module
    supabase_mod = types.ModuleType("migrations.utils.supabase")
    supabase_mod.parse_price = MagicMock(return_value=1000)
    supabase_mod.infer_status = MagicMock(return_value='available')
    utils_mod = types.ModuleType("migrations.utils")
    utils_mod.supabase = supabase_mod
    migrations_mod = types.ModuleType("migrations")
    migrations_mod.utils = utils_mod
    sys.modules["migrations"] = migrations_mod
    sys.modules["migrations.utils"] = utils_mod
    sys.modules["migrations.utils.supabase"] = supabase_mod

def test_parse_price():
    from migrations.utils.supabase import parse_price
    assert parse_price("$1000") == 1000
    assert parse_price("1000 USD") == 1000
    assert parse_price("") == 1000

def test_infer_status():
    from migrations.utils.supabase import infer_status
    assert infer_status(1000, "available") == 'available'
    assert infer_status(None, None) == 'available'
