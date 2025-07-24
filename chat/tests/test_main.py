from chat.main import MessageRequest, WebhookRequest, chat, on_neighbourhoods_change
import pytest
from fastapi import Header
import asyncio

# Test MessageRequest and WebhookRequest models
def test_message_request():
    req = MessageRequest(message="Hello", session_id="abc123")
    assert req.message == "Hello"
    assert req.session_id == "abc123"

def test_webhook_request():
    req = WebhookRequest(event="update", data={"id": 1})
    assert req.event == "update"
    assert req.data == {"id": 1}

# Test chat endpoint (sync call for test)
@pytest.mark.asyncio
def test_chat():
    req = MessageRequest(message="Test", session_id="test1")
    result = asyncio.run(chat(req, authorization="Bearer test"))
    assert result is not None

# Test on_neighbourhoods_change
def test_on_neighbourhoods_change():
    req = WebhookRequest(event="delete", data={"id": 2})
    result = on_neighbourhoods_change(req)
    assert result is not None
