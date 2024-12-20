import { getMessagesByConversation } from "../dbQueries";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { addMessage } from "../dbQueries";
import { createConversation } from "@/utils/conversationHelpers";
import { getUserId } from "@/utils/conversationHelpers";

export async function GET(request: Request) {
  const conversationId = request.headers.get("conversation-id");

  if (!conversationId) {
    return NextResponse.json(
      { error: "Conversation ID is required!" },
      { status: 400 }
    );
  }

  try {
    const messages = await getMessagesByConversation(conversationId);

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { message: "No messages found for the specified conversation ID." },
        { status: 404 }
      );
    }

    return NextResponse.json(messages, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching messages:", error.message);
    return NextResponse.json(
      { error: "An error occurred while fetching messages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
      // Parse request JSON
      const { conversation_id, sender, message_text } = await request.json();
  
      // Validate required fields
      if (!sender || !message_text) {
        return NextResponse.json(
          { error: "Missing required fields: sender or message_text." },
          { status: 400 }
        );
      }
  
      // Get authenticated user's ID
      const userId = await getUserId();
      if (!userId) {
        return NextResponse.json(
          { error: "User is not logged in or session is invalid." },
          { status: 401 }
        );
      }
  
      // Check if a new conversation is required
      let conversationId = conversation_id;
  
      if (!conversationId) {
  
         // Create a new conversation
        const newConversation = await createConversation(userId);
  
        if (!newConversation) {
          return NextResponse.json(
            { error: "Failed to create a new conversation." },
            { status: 500 }
          );
        }
  
        conversationId = newConversation; // conversation_id from createConversation
      }
  
      // Add message to the conversation
      const newMessage = await addMessage(conversationId, sender, message_text);
  
      if (!newMessage) {
        return NextResponse.json(
          { error: "Failed to save the message." },
          { status: 500 }
        );
      }
  
      // Return the new conversation and message
      return NextResponse.json(
        { conversation_id: conversationId, message: newMessage },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Unexpected error in POST /messages:", error.message);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  }
