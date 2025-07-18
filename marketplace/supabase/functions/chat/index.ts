import { addMessageToChat } from "./add-message-to-chat.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { HumanMessage, AIMessage } from "npm:@langchain/core/messages";
import { agent } from "./agent.ts";
import { getSystemPrompt } from "./system-prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid or missing JSON body." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const { message, chat_id: chatId } = body;

    if (!message) {
      return new Response(
        JSON.stringify({
          error: "Message field is missing in the request body.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    if (!chatId) {
      return new Response(
        JSON.stringify({ error: "Chat ID is missing in the request body." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }
    // Add the message to the database
    await addMessageToChat(supabase, user.id, chatId, message);

    // Get the chat from supabase
    const { data: chatSession, error: chatError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", chatId)
      .single();

    if (chatError || !chatSession) {
      console.error("Error fetching chat session:", chatError);
      return new Response(
        JSON.stringify({ error: "Chat session not found." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Check if the chat is an AI chat
    const isAI = !chatSession.user_two;

    // If it's not an AI chat, return after adding the message to the database
    if (!isAI) {
      return new Response(
        JSON.stringify({ success: true, message: "Message added to chat." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If it's an AI chat, get a response from the agent
    // Fetch all messages
    const { data: messagesFromDatabase, error: messagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_session_id", chatId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching chat messages:", messagesError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch chat messages." }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const messages = [getSystemPrompt()];
    messagesFromDatabase.forEach((msg) => {
      messages.push(
        msg.sent_by ? new HumanMessage(msg.message) : new AIMessage(msg.message)
      );
    });

    // Get a response from the agent
    const agentNextState = await agent.invoke({ messages: messages });
    const aiResponse = agentNextState.messages.at(-1).content as string;

    // Add the AI response to the database
    await addMessageToChat(supabase, "ai", chatId, aiResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Complete",
        ai_response: aiResponse,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
