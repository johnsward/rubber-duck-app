import { supabase } from "../lib/supabaseClient";
import { saveMessageToDatabase } from "./messageHelpers";

export const startNewConversation = async (
  firstMessage: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  if (!firstMessage.trim()) {
    return {
      success: false,
      error: "First message is required to start a conversation!",
    };
  }

  try {
    const user_id = await getUserId();
    if (!user_id) {
      return {
        success: false,
        error: "User is not logged in, or session is invalid.",
      };
    }

    // Step 1: Create a new conversation in the database
    const conversationId = await createConversation(user_id);

    if (!conversationId) {
      return {
        success: false,
        error: "Failed to start a new conversation.",
      };
    }

    // Step 2: Generate a title for the conversation
    const title = await fetchConversationTitle(firstMessage);

    if (!title) {
      console.warn(
        "Failed to generate a title for the conversation. Using default title."
      );
    } else {
      // Step 3: Update the conversation title
      const titleUpdateResult = await updateConversationTitle(
        conversationId,
        title
      );

      if (!titleUpdateResult.success) {
        console.error(
          "Failed to update conversation title:",
          titleUpdateResult.error
        );
        return {
          success: false,
          error: "Failed to update conversation title.",
        };
      }
    }

    return { success: true, data: conversationId };
  } catch (error: any) {
    console.error("Error starting new conversation:", error.message);
    return {
      success: false,
      error: error.message || "An unexpected error occurred.",
    };
  }
};

// Helper to fetch conversation title
export const fetchConversationTitle = async (
  firstMessage: string
): Promise<string | null> => {
  try {
    const response = await fetch("/api/conversations/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: firstMessage }),
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch conversation title:",
        await response.text()
      );
      return null;
    }

    const { title } = await response.json();
    return title;
  } catch (error: any) {
    console.error("Error fetching conversation title:", error.message);
    return null;
  }
};

export const getUserId = async (): Promise<string | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData?.session?.user?.id) {
      // No session found, return null without logging it as an error
      return null;
    }

    return sessionData.session.user.id;
  } catch (error: any) {
    console.error("Unexpected error fetching user session:", error.message);
    return null;
  }
};

export const createConversation = async (
  userId: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .insert([{ user_id: userId, title: "New Chat" }])
      .select("conversation_id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error.message);
      return null;
    }

    if (!data?.conversation_id) {
      console.error("Unexpected response: Missing conversation_id.");
      return null;
    }

    return data.conversation_id; // Successfully created conversation
  } catch (error: any) {
    console.error("Unexpected error occurred while creating conversation:", error.message);
    return null;
  }
};

export const updateConversationTitle = async (
  conversationId: string,
  userMessage: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Step 1: Call the API to generate a title
    const titleResponse = await fetch("/api/conversations/title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!titleResponse.ok) {
      const errorText = await titleResponse.text();
      console.error("Failed to generate title:", errorText);
      return { success: false, error: "Failed to generate title" };
    }

    const { title } = await titleResponse.json();

    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("conversation_id", conversationId);

    if (error) {
      console.error("Error updating conversation title:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error(
      "Unexpected error updating conversation title:",
      error.message
    );
    return { success: false, error: "An unexpected error occurred." };
  }
};

export const deleteConversation = async (
  conversationId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .delete()
      .eq("conversation_id", conversationId)
      .select();

    if (error) {
      console.error("Error deleting conversation");
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    console.error(
      "Unexpected error when deleteting conversation",
      error.message
    );
    return { success: false, error: "An unexpected error occurred." };
  }
};

export const getConversationById = async (
  conversationId: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const {data, error} = await supabase.from("conversations").select("*").eq("conversation_id", conversationId).single();

    if (error) {
      console.error("Error fetching conversation by ID:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Unable to fetch conversation by ID:", error.message);
    return { success: false, error: error.message };
  }
};

export const createNewChat = async (
  initialMessage?: string,
  redirectCallback?: (conversationId: string) => void
) => {
  const userId = await getUserId();
  if (!userId) {
    console.error("User ID not available.");
    return null;
  }

  const conversationId = await createConversation(userId);
  if (!conversationId) {
    console.error("Failed to create a new conversation.");
    return null;
  }

  // Perform redirection if a callback is provided
  if (redirectCallback) {
    redirectCallback(conversationId);
  }

  // Handle initial message
  if (initialMessage) {
    await updateConversationTitle(conversationId, initialMessage);
    await saveMessageToDatabase(conversationId, "user", initialMessage);
  }

  return conversationId;
};

