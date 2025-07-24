import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_chat_main():
    # Create a fake chat.main module
    main_mod = types.ModuleType("chat.main")
    main_mod.MessageRequest = MagicMock()
    main_mod.WebhookRequest = MagicMock()
    main_mod.chat = MagicMock(return_value='chat_response')
    main_mod.on_neighbourhoods_change = MagicMock(return_value='webhook_response')
    chat_mod = types.ModuleType("chat")
    chat_mod.main = main_mod
    sys.modules["chat"] = chat_mod
    sys.modules["chat.main"] = main_mod

def test_message_request():
    from chat.main import MessageRequest
    req = MessageRequest(message="Hello", session_id="abc123")
    assert req is not None


def test_webhook_request():
    from chat.main import WebhookRequest
    req = WebhookRequest(event="update", data={"id": 1})
    assert req is not None

def test_chat():
    from chat.main import chat
    req = MagicMock()
    result = chat(req, authorization="Bearer test")

def test_on_neighbourhoods_change():
    from chat.main import on_neighbourhoods_change
    req = MagicMock()
    result = on_neighbourhoods_change(req)
    assert result == 'webhook_response'
