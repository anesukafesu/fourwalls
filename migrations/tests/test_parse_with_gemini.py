from migrations.utils.parse_with_gemini import parse_with_gemini
import pytest
import asyncio

@pytest.mark.asyncio
def test_parse_with_gemini():
    posts = [{"text": "Sample post"}]
    result = asyncio.run(parse_with_gemini(posts))
    assert isinstance(result, list)
