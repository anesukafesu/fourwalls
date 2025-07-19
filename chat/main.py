from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import Optional, List, TypedDict
from agent import agent
from supabase import TableRecord
from supabase_client import client
from neighbourhoods import neighbourhood_lookup
from json import load
import os

services = load('services.json')
SUPABASE_URL = services['SUPABASE']
SUPABASE_ANON_KEY =  os.getenv("SUPABASE_ANON_KEY")

with open('system_prompt.txt') as f:
  system_prompt_content = f.read()

system_prompt = SystemMessage(
  content=system_prompt_content
)

app = FastAPI()

class MessageRequest(BaseModel):
  message: str
  chat_id: str

class WebhookRequest(BaseModel):
  type: string
  table: string
  schema: string
  record: TableRecord
  old_record: null

@app.post("/chat")
async def chat(request: MessageRequest, authorization: str = Header(...)):
  access_token = authorization.replace("Bearer ", "")
  user = client.auth.get_user(access_token).user
  if not user:
    raise HTTPException(status_code=401, detail="Invalid or expired token.")

  client.table("chat_messages").insert({
    "chat_session_id": request.chat_id,
    "message": request.message,
    "sent_by": user.id
  }).execute()

  chat_session = client.table("chat_sessions").select("*").eq("id", request.chat_id).execute()
  if not chat_session.data:
    raise HTTPException(status_code=404, detail="Chat session not found")

  is_ai = not chat_session.data[0].get("user_two")
  if not is_ai:
    return { "success": True, "message": "Message added to chat." }

  messages = client.table("chat_messages").select("*").eq("chat_session_id", request.chat_id).order("created_at", desc=False).execute()
  history = [system_prompt]
  for msg in messages.data:
    if msg["sent_by"] == user.id:
      history.append(HumanMessage(content=msg["message"]))
    else:
      history.append(AIMessage(content=msg["message"]))

  state = { "messages": history }
  result = agent.invoke(state)
  final_message = result["messages"][-1].content

  client.table("chat_messages").insert({
    "chat_session_id": request.chat_id,
    "message": final_message,
    "sent_by": None
  }).execute()

  return { "success": True, "ai_response": final_message }

@app.post('/on-neighbourhoods-change')
def on_neighbourhoods_change(request: WebhookRequest):
  id = request.record['id']
  name = request.record['name']

  if request.type == "INSERT":
    neighbourhood_lookup.add_neighbourhood(name, id)

  if request.type == "UPDATE":
    neighbourhood_lookup.update_neighbourhood(name, id)

  if request.type == "DELETE":
    neighbourhood_lookup.delete_neighbourhood(id)

  return { "success": True }
