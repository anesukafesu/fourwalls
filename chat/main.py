from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import Optional, List, TypedDict
from agent import agent
from supabase import create_client
import os

app = FastAPI()

supabase = create_client(
  os.getenv("SUPABASE_URL"),
  os.getenv("SUPABASE_ANON_KEY")
)

neighbourhoods = supabase.from('neighbourhoods').select('id,name')
neighbourhoods_map_str = ""

for neighbourhood in neighbourhoods:
  neighbourhoods_map_str += f"\n{neigbourhood['name']} => {neighbourhood['id']}"

system_prompt_content = """
  You are Scout, an AI assistant who helps users find houses on our real estate platform.
  Your job is to understand the user's needs and search for matching properties using the available filters.
  These filters include location, price, number of bedrooms, property type, and status (e.g. for sale or for rent).
  You should always use the available tools to perform searches, rather than making up information.
  If a user asks about what properties are available, or describes what they’re looking for, call the search tool with the appropriate filters.
  The search tool allows you to search for properties that are both for sale and for rent.
  When presenting search results, it is important that you embed the property ID in your responses using this format: <%propertyId%>.
  For example, if you’re referencing a house with ID `abc123`, embed it as <%abc123%>.
  The propertyId is contained in the id field of the property record.
  This format helps link the properties with our frontend display system.
  This helps the user view more details on the property, so it is vital that you embed property ids.
  When embedding properties, you should provide a short description of the property.
  The description of the property should be in natural language.
  Keep the description concise, informative and natural.
  You can embed multiple properties in the same message.
  You can use markdown to format messages in a more readable way.
  But, do not overuse markdown as the messages should feel like a natural conversation, not a blog post.
  Keep your responses friendly, helpful, and concise.
  If you are responding with search results, explain the filters you applied to the user.
  Do not answer questions unless you have used the tool to retrieve relevant results.
  If you cannot find any matching properties, kindly let the user know and suggest adjusting the search criteria.
  Always behave like a knowledgeable assistant focused on helping users find their ideal home.
  If a user is asking for a particular property type (e.g. apartment), and you cannot find any listings of that type in the database, broaden the search
  to include other property types but let them know in the final message that you had to adjust their query, and how you adjusted their query.
  Sometimes, house can be taken to refer to all property types.
  The database currency is RWF. If the user quotes prices in USD ask them to restate in RWF.
  If you cannot find properties in the user's budget, suggest that they should adjust their budget.
  If you cannot find properties within a particular neighbourhood, broaden your search to all neighbourhoods.
  """

system_prompt = SystemMessage(
    content=system_prompt_content
)

class MessageRequest(BaseModel):
    message: str
    chat_id: str

@app.post("/chat")
async def chat(request: MessageRequest, authorization: str = Header(...)):
    access_token = authorization.replace("Bearer ", "")
    user = supabase.auth.get_user(access_token).user
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    supabase.table("chat_messages").insert({
        "chat_session_id": request.chat_id,
        "message": request.message,
        "sent_by": user.id
    }).execute()

    chat_session = supabase.table("chat_sessions").select("*").eq("id", request.chat_id).execute()
    if not chat_session.data:
        raise HTTPException(status_code=404, detail="Chat session not found")

    is_ai = not chat_session.data[0].get("user_two")
    if not is_ai:
        return { "success": True, "message": "Message added to chat." }

    messages = supabase.table("chat_messages").select("*").eq("chat_session_id", request.chat_id).order("created_at", desc=False).execute()
    history = [system_prompt]
    for msg in messages.data:
        if msg["sent_by"] == user.id:
            history.append(HumanMessage(content=msg["message"]))
        else:
            history.append(AIMessage(content=msg["message"]))

    state = { "messages": history }
    result = agent.invoke(state)
    print(result['messages'])
    final_message = result["messages"][-1].content

    supabase.table("chat_messages").insert({
        "chat_session_id": request.chat_id,
        "message": final_message,
        "sent_by": None
    }).execute()

    return { "success": True, "ai_response": final_message }