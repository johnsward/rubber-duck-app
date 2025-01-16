import { useState, useEffect, useRef } from "react";
import { getMessagesByConversation } from "@/app/api/dbQueries";
import { saveMessageToDatabase } from "@/utils/messageHelpers";
import { initializeSSE, closeSSE } from "@/app/services/sseService";

interface ConversationEntry {
    userMessage: string;
    aiResponse: string | null;
    loading: boolean;
  }

export const useConversation = (
  conversationId: string | null,
  pendingMessage: string | null,
  setPendingMessage: (msg: string | null) => void
) => {
  const [conversationEntries, setConversationEntries] = useState<ConversationEntry[]>([]);
  const eventSourceRef = useRef<() => void>();

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const messages = await getMessagesByConversation(conversationId);
        const entries = messages.map((message) => ({
          userMessage: message.sender === "user" ? message.message_text : "",
          aiResponse: message.sender === "ai" ? message.message_text : null,
          loading: false,
        }));
        setConversationEntries(entries);

        // Process pending message if any
        if (pendingMessage) {
          await processMessage(conversationId, pendingMessage);
          setPendingMessage(null);
        }

        // Initialize SSE for unanswered messages
        const lastEntry = entries[entries.length - 1];
        if (lastEntry && lastEntry.userMessage && !lastEntry.aiResponse) {
            setTimeout(() => {
                initializeSSEForUnansweredMessage(conversationId);
              }, 1000);
        }
      } catch (error) {
        console.error("Error fetching conversation messages:", error);
      }
    };

    fetchMessages();

    return () => {
      closeSSE();
      eventSourceRef.current?.();
    };
  }, [conversationId]);

  const processMessage = async (conversationId: string, message: string) => {
    try {
      await saveMessageToDatabase(conversationId, "user", message);
      const newEntry: ConversationEntry = { userMessage: message, aiResponse: null, loading: true };
      setConversationEntries((prev) => [...prev, newEntry]);
      initializeSSEForUnansweredMessage(conversationId);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const initializeSSEForUnansweredMessage = (conversationId: string) => {
    let accumulatedResponse = "";

    const handleMessage = (message: any) => {
      if (message.content) {
        accumulatedResponse += message.content;
        setConversationEntries((prev) =>
          prev.map((entry, idx) =>
            idx === prev.length - 1
              ? { ...entry, aiResponse: accumulatedResponse, loading: true }
              : entry
          )
        );
      }
    };

    const handleComplete = async () => {
      if (accumulatedResponse) {
        await saveMessageToDatabase(conversationId, "ai", accumulatedResponse);
        setConversationEntries((prev) =>
          prev.map((entry, idx) =>
            idx === prev.length - 1 ? { ...entry, loading: false } : entry
          )
        );
      }
    };

    const handleError = () => {
      console.error("SSE connection error.");
    };

    eventSourceRef.current = initializeSSE(conversationId, handleMessage, handleError, handleComplete);
  };

  return {
    conversationEntries,
    processMessage,
    initializeSSEForUnansweredMessage,
  };
};