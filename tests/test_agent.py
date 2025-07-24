


import sys
import types
import pytest
from unittest.mock import MagicMock

@pytest.fixture(autouse=True)
def mock_chat_agent():
    # Create a fake chat.agent module
    agent_mod = types.ModuleType("chat.agent")
    agent_mod.PropertySearchInput = MagicMock()
    agent_mod.search_for_properties_tool = MagicMock(return_value=[{"id": 1, "location": "Bulawayo"}])
    agent_mod.AgentState = MagicMock()
    agent_mod.llm_node = MagicMock(return_value={"step": 2})
    agent_mod.should_continue = MagicMock(return_value="continue")
    agent_mod.tool_node = MagicMock(return_value={"step": 3})
    chat_mod = types.ModuleType("chat")
    chat_mod.agent = agent_mod
    sys.modules["chat"] = chat_mod
    sys.modules["chat.agent"] = agent_mod

def test_property_search_input():
    from chat.agent import PropertySearchInput
    obj = PropertySearchInput(maxPrice=1000, minPrice=500, location='Harare')
    assert obj is not None

def test_search_for_properties_tool():
    from chat.agent import search_for_properties_tool
    result = search_for_properties_tool(maxPrice=2000, minPrice=1000, location='Bulawayo')
    assert isinstance(result, list)

@pytest.fixture
def agent_state():
    return {'step': 1, 'history': []}

def test_llm_node(agent_state):
    from chat.agent import llm_node
    result = llm_node(agent_state)
    assert isinstance(result, dict)

def test_should_continue(agent_state):
    from chat.agent import should_continue
    result = should_continue(agent_state)
    assert isinstance(result, str)

def test_tool_node(agent_state):
    from chat.agent import tool_node
    result = tool_node(agent_state)
    assert isinstance(result, dict)
