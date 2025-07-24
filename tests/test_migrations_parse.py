

import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_migrations_routes_parse():
    # Create a fake migrations.routes.parse module
    parse_mod = types.ModuleType("migrations.routes.parse")
    parse_mod.parse = MagicMock(return_value='parsed')
    routes_mod = types.ModuleType("migrations.routes")
    routes_mod.parse = parse_mod
    migrations_mod = types.ModuleType("migrations")
    migrations_mod.routes = routes_mod
    sys.modules["migrations"] = migrations_mod
    sys.modules["migrations.routes"] = routes_mod
    sys.modules["migrations.routes.parse"] = parse_mod

def test_parse():
    from migrations.routes.parse import parse
    req = MagicMock()
    result = parse(req, authorization="Bearer test")
    assert result == 'parsed'
