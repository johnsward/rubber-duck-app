import { supabase } from "@/lib/supabaseClient";

interface Message {
  conversation_id: string;
  sender: "user" | "ai";
  message_text: string;
  created_at?: string;
}

export const saveMessageToDatabase = async (
  conversationId: string,
  sender: "user" | "ai",
  messageText: string
): Promise<{ success: boolean; data?: Message; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender,
        message_text: messageText,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save message to the database:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Unexpected error saving message to the database:", error.message);
    return { success: false, error: error.message };
  }
};