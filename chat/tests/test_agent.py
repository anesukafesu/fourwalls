import pytest
from chat.agent import PropertySearchInput, search_for_properties_tool, AgentState, llm_node, should_continue, tool_node

# Test PropertySearchInput model
def test_property_search_input():
    data = {'maxPrice': 1000, 'minPrice': 500, 'location': 'Harare'}
    obj = PropertySearchInput(**data)
    assert obj.maxPrice == 1000
    assert obj.minPrice == 500
    assert obj.location == 'Harare'

# Test search_for_properties_tool function
def test_search_for_properties_tool():
    result = search_for_properties_tool(maxPrice=2000, minPrice=1000, location='Bulawayo')
    assert isinstance(result, list) or result is None

# Test AgentState and llm_node, should_continue, tool_node
@pytest.fixture
def agent_state():
    return {'step': 1, 'history': []}

def test_llm_node(agent_state):
    result = llm_node(agent_state)
    assert isinstance(result, dict)

def test_should_continue(agent_state):
    result = should_continue(agent_state)
    assert isinstance(result, str)

def test_tool_node(agent_state):
    result = tool_node(agent_state)
    assert isinstance(result, dict)
