from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import Optional, Literal
from agent import agent
from supabase_client import client
from neighbourhoods import neighbourhood_lookup
from json import load
import os

# Load service URLs
with open('services.json') as f:
    services = load(f)

SUPABASE_URL = services.get('SUPABASE', '')
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Load system prompt content
with open('system_prompt.txt') as f:
    system_prompt_content = f.read()

system_prompt = SystemMessage(content=system_prompt_content)

app = FastAPI()


class MessageRequest(BaseModel):
    message: str
    chat_id: str


class WebhookRequest(BaseModel):
    type: Literal["INSERT", "UPDATE", "DELETE"]
    table: str
    schema: str
    record: dict
    old_record: Optional[dict] = None


@app.post("/chat")
async def chat(request: MessageRequest, authorization: str = Header(...)):
    access_token = authorization.replace("Bearer ", "")
    user_response = client.auth.get_user(access_token)
    user = user_response.user if user_response else None

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    # Insert user message into chat_messages
    client.table("chat_messages").insert({
        "chat_session_id": request.chat_id,
        "message": request.message,
        "sent_by": user.id
    }).execute()

    # Retrieve chat session details
    chat_session = client.table("chat_sessions").select("*").eq("id", request.chat_id).execute()
    if not chat_session.data:
        raise HTTPException(status_code=404, detail="Chat session not found")

    is_ai = not chat_session.data[0].get("user_two")
    if not is_ai:
        return { "success": True, "message": "Message added to chat." }

    # Fetch full chat history
    messages = client.table("chat_messages")\
        .select("*")\
        .eq("chat_session_id", request.chat_id)\
        .order("created_at", desc=False)\
        .execute()

    # Construct message history
    history = [system_prompt]
    for msg in messages.data:
        if msg["sent_by"] == user.id:
            history.append(HumanMessage(content=msg["message"]))
        else:
            history.append(AIMessage(content=msg["message"]))

    # Generate AI response
    state = { "messages": history }
    result = agent.invoke(state)
    final_message = result["messages"][-1].content

    # Insert AI response into chat_messages
    client.table("chat_messages").insert({
        "chat_session_id": request.chat_id,
        "message": final_message,
        "sent_by": None
    }).execute()

    return { "success": True, "ai_response": final_message }


@app.post("/on-neighbourhoods-change")
def on_neighbourhoods_change(request: WebhookRequest):
    id = request.record.get("id")
    name = request.record.get("name")

    if request.type == "INSERT":
        neighbourhood_lookup.add_neighbourhood(name, id)
    elif request.type == "UPDATE":
        neighbourhood_lookup.update_neighbourhood(name, id)
    elif request.type == "DELETE":
        neighbourhood_lookup.delete_neighbourhood(id)

    return { "success": True }
