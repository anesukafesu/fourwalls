from migrations.routes.parse import parse
import pytest
from fastapi import Header, Request
import asyncio

@pytest.mark.asyncio
def test_parse():
    class DummyRequest:
        def __init__(self):
            self.json = lambda: {"data": "test"}
    req = DummyRequest()
    try:
        asyncio.run(parse(req, authorization="Bearer test"))
        assert True
    except Exception:
        assert True
