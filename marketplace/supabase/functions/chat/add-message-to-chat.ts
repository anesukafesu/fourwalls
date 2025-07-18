import { SupabaseClient } from "npm:@supabase/supabase-js";

export async function addMessageToChat(
  supabase: SupabaseClient,
  from: string,
  chatId: string,
  message: string
) {
  try {
    const { error } = await supabase.from("chat_messages").insert({
      chat_session_id: chatId,
      sent_by: from === "ai" ? undefined : from,
      message: message,
    });
    if (error) {
      console.error("Error inserting message into chat:", error);
      throw new Error("Failed to add message to chat");
    }
  } catch (error) {
    console.error("Error adding message to chat:", error);
    throw new Error("Failed to add message to chat");
  }
}
