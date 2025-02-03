import { useState, useEffect, useRef } from "react";
import { getMessagesByConversation } from "@/app/api/dbQueries";
import { saveMessageToDatabase } from "@/utils/messageHelpers";
import { initializeSSE, closeSSE } from "@/app/services/sseService";
import {
  getConversationById,
  updateConversationTitle,
} from "@/utils/conversationHelpers";

interface ConversationEntry {
  userMessage: string;
  aiResponse: string | null;
  loading: boolean;
}

interface SSEMessage {
  content?: string;
}

export const useConversation = (
  conversationId: string | null,
  pendingMessage: string | null,
  setPendingMessage: (msg: string | null) => void
) => {
  const [conversationEntries, setConversationEntries] = useState<
    ConversationEntry[]
  >([]);
  const eventSourceRef = useRef<() => void>();
  const activeSSERef = useRef<boolean>(false);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const messages = await getMessagesByConversation(conversationId);
        const fetchedEntries = messages.map((message) => ({
          userMessage: message.sender === "user" ? message.message_text : null,
          aiResponse: message.sender === "ai" ? message.message_text : null,
          loading: false,
        }));

        const storedMessage = localStorage.getItem("pendingMessage");
        const hasUserMessage = fetchedEntries.some(
          (entry) => entry.userMessage
        );

        if (!hasUserMessage && storedMessage) {
          fetchedEntries.push({
            userMessage: storedMessage,
            aiResponse: null,
            loading: true,
          });

          setConversationEntries([...fetchedEntries]);
          setPendingMessage(null);
          localStorage.removeItem("pendingMessage");

          setTimeout(() => {
            initializeSSEForUnansweredMessage(conversationId);
          }, 500);
        }

        setConversationEntries(fetchedEntries);

        setPendingMessage(null);
        localStorage.removeItem("pendingMessage");

        // Initialize SSE for unanswered messages
        const lastEntry = fetchedEntries[fetchedEntries.length - 1];
        if (lastEntry?.userMessage && !lastEntry.aiResponse) {
          initializeSSEForUnansweredMessage(conversationId);
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
      const newEntry: ConversationEntry = {
        userMessage: message,
        aiResponse: null,
        loading: true,
      };
      setConversationEntries((prev) => [...prev, newEntry]);

      const conversation = await getConversationById(conversationId);

      if (conversation?.data?.title === "New Chat") {
        try {
          await updateConversationTitle(conversationId, message);
        } catch (error) {
          console.warn("ailed to update conversation title:", error);
        }
      }
      
      initializeSSEForUnansweredMessage(conversationId);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  const initializeSSEForUnansweredMessage = (conversationId: string) => {
    if (activeSSERef.current) {
      return;
    }
    activeSSERef.current = true;

    let accumulatedResponse = "";

    const handleMessage = (message: SSEMessage) => {
      if (message.content) {
        accumulatedResponse += message.content;

        setConversationEntries((prev) =>
          prev.map((entry, idx) =>
            idx === prev.length - 1
              ? { ...entry, aiResponse: accumulatedResponse, loading: false }
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
            idx === prev.length - 1
              ? { ...entry, aiResponse: accumulatedResponse, loading: false }
              : entry
          )
        );
      }
      activeSSERef.current = false; // Mark as inactive after completion
    };

    const handleError = () => {
      console.error("SSE connection error.");
      activeSSERef.current = false;
    };

    eventSourceRef.current = initializeSSE(
      conversationId,
      handleMessage,
      handleError,
      handleComplete
    );
  };

  return {
    conversationEntries,
    processMessage,
    initializeSSEForUnansweredMessage,
  };
};
