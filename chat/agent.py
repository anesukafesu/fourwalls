from pydantic import BaseModel, Field
from typing import Optional, List, TypedDict
from langchain_core.tools import tool, Tool
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import END, StateGraph
from langgraph.prebuilt import ToolNode
from supabase import create_client
import os

google_api_key = os.getenv("GOOGLE_API_KEY")
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

class PropertySearchInput(BaseModel):
    maxPrice: Optional[float] = None
    minPrice: Optional[float] = None
    minBedrooms: Optional[int] = None
    maxBedrooms: Optional[int] = None
    minBathrooms: Optional[int] = None
    maxBathrooms: Optional[int] = None
    propertyType: Optional[str] = None
    neighbourhood: Optional[str] = None
    status: Optional[str] = None


@tool("search_for_properties", args_schema=PropertySearchInput)
def search_for_properties_tool(maxPrice: int = None, minPrice: int = None,
                               minBedrooms: int = None, maxBedrooms: int = None,
                               minBathrooms: int = None, maxBathrooms: int = None,
                               propertyType: str = None,
                               neighbourhood: str = None, status: str = None
                               ) -> List[dict]:
    """
    Search for properties using a combination of filters provided by the user.

    This tool queries the 'properties' table in the database and returns all listings
    that match the specified filters. All filters are optional and can be combined to
    narrow down the results. It supports searching by location, price range, bedrooms,
    bathrooms, property type, and status (for sale or rent).

    Parameters (all optional):
        - maxPrice: Maximum price of the property.
        - minPrice: Minimum price of the property.
        - minBedrooms: Minimum number of bedrooms required.
        - maxBedrooms: Maximum number of bedrooms required.
        - minBathrooms: Minimum number of bathrooms required.
        - maxBathrooms: Maximum number of bathrooms required.
        - propertyType: The type of property (e.g. house, apartment).
        - neighbourhood: The neighbourhood or area to search in.
        - status: Whether the property is for sale or for rent.

    Returns:
        A list of property records (dictionaries) that match the search criteria.

    Usage example:
        The assistant may call:
        search_for_properties({
            "bedrooms": 2,
            "status": "for_rent",
            "maxPrice": 800,
            "neighbourhood": "Kacyiru"
        })

    Notes:
        - The assistant should never guess or fabricate property data.
        - Always use this tool when the user is asking to see or search for properties.
    """

    query = supabase.table("properties").select("*")

    if neighbourhood:
        query = query.eq("neighbourhood", neighbourhood)
    if status:
        query = query.eq("status", status)
    if propertyType:
        query = query.eq("property_type", propertyType)
    if minBedrooms:
        query = query.gte("bedrooms", minBedrooms)
    if maxBedrooms:
        query = query.gte("bedrooms", maxBedrooms)
    if minBathrooms:
        query = query.gte("bathrooms", minBathrooms)
    if maxBathrooms:
        query = query.gte("bathrooms", maxBathrooms)
    if minPrice:
        query = query.gte("price", minPrice)
    if maxPrice:
        query = query.lte("price", maxPrice)

    try:
      response = query.execute()
    except e:
      print(f"Error executing query: {e}")
      return []

    return response.data

tools = [search_for_properties_tool]


llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite-preview-06-17",
    temperature=0,
    google_api_key=google_api_key
)
llm = llm.bind_tools(tools)

    
class AgentState(TypedDict):
    messages: List[BaseMessage]


def llm_node(state: AgentState) -> AgentState:
    """Invokes the LLM to reason and decide on tool use."""
    response = llm.invoke(state['messages'])

    tool_calls = getattr(response, "tool_calls", None)

    # If tool call was made, store it in AIMessage
    if tool_calls:
        # Always provide an empty string for content when there are tool calls
        state['messages'].append(
            AIMessage(content="", tool_calls=tool_calls)
        )
    else:
        content = response.content or "I'm sorry, I wasn't able to generate a response."
        state['messages'].append(AIMessage(content=content.strip()))

    return state


def should_continue(state: AgentState) -> str:
    last_message = state['messages'][-1]
    # Check for tool_calls attribute and if the list is not empty
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "continue"
    return "end"


def tool_node(state: AgentState) -> AgentState:
    # Get the most recent AIMessage that called the tool
    last_message = state["messages"][-1]
    tool_call = last_message.tool_calls[0]  # Only handling one tool call here for simplicity

    tool_name = tool_call["name"]
    tool_args = tool_call["args"]
    tool_call_id = tool_call["id"]

    # Find and execute the tool
    tool: Tool = next(t for t in tools if t.name == tool_name)
    tool_result = tool.invoke(tool_args)

    # Add the result to the messages as a ToolMessage
    state["messages"].append(
        ToolMessage(content=str(tool_result), tool_call_id=tool_call_id)
    )

    return state


graph = StateGraph(AgentState)
graph.add_node("llm_node", llm_node)
graph.add_node("tool_node", tool_node)
graph.set_entry_point("llm_node")
graph.add_conditional_edges(
    "llm_node",
    should_continue,
    {
        "continue": "tool_node",
        "end": END
    }
)
graph.add_edge("tool_node", "llm_node")
agent = graph.compile()