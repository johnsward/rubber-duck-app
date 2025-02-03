import { supabase } from "@/lib/supabaseClient";

export async function getConversationsByUser(userId: string|null) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function addMessage(
  conversationId: string,
  sender: string,
  messageText: string
) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert([
        { conversation_id: conversationId, sender, message_text: messageText },
      ])
      .select();

    if (error) {
      console.error("Error adding message(s):", error.message);
      throw new Error(error.message);
    }
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding message:", error.message);
      throw new Error(error.message);
    }
  }
}

export async function getMessagesByConversation(conversationId: string) {
  const { data, error } = await supabase
  .from("messages")
  .select("message_id, sender, message_text, created_at")
  .eq("conversation_id", conversationId)
  .not("message_text", "is", null)
  .neq("message_text", "")
  .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error.message);
    throw new Error(error.message);
  }
  return data;
}
