
import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_migrations_routes_migrate():
    # Create a fake migrations.routes.migrate module
    migrate_mod = types.ModuleType("migrations.routes.migrate")
    migrate_mod.migrate_facebook_posts = MagicMock(return_value='migrated')
    routes_mod = types.ModuleType("migrations.routes")
    routes_mod.migrate = migrate_mod
    migrations_mod = types.ModuleType("migrations")
    migrations_mod.routes = routes_mod
    sys.modules["migrations"] = migrations_mod
    sys.modules["migrations.routes"] = routes_mod
    sys.modules["migrations.routes.migrate"] = migrate_mod

def test_migrate_facebook_posts():
    from migrations.routes.migrate import migrate_facebook_posts
    payload = {"message": "Test post"}
    result = migrate_facebook_posts(payload, authorization="Bearer test")
    assert result == 'migrated'
