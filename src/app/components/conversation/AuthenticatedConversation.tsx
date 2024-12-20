"use client";
import { useLoading } from "@/app/context/LoadingContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getMessagesByConversation } from "@/app/api/dbQueries";
import {
  createConversation,
  getConversationById,
  updateConversationTitle,
} from "@/utils/conversationHelpers";
import { saveMessageToDatabase } from "@/utils/messageHelpers";
import { UserMessage } from "./UserMessage";
import Response from "./Response";
import CodeInput from "./CodeInput";
import { styles } from "../../styles/styles";
import { analyzeCode } from "../CodeAnalyzer";
import { Introduction } from "../Introduction";
import { CircularProgress } from "@mui/material";
import { openAiInstructions } from "@/utils/openAiHelpers";

interface ConversationEntry {
  userMessage: string;
  aiResponse: string | null;
  loading: boolean;
}

interface AuthenticatedConversationProps {
  conversationId?: string;
}

const AuthenticatedConversation: React.FC<AuthenticatedConversationProps> = ({
  conversationId: initialConversationId,
}) => {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [conversationEntries, setConversationEntries] = useState<
    ConversationEntry[]
  >([]);
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { isLoading, setLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationEntries]);

  useEffect(() => {
    const validateConversation = async () => {
      if (conversationId) {
        const { data, error } = await supabase
          .from("conversations")
          .select("conversation_id")
          .eq("conversation_id", conversationId)
          .single();

        if (error || !data) {
          console.error(
            "Invalid conversationId:",
            error?.message || "Not found"
          );
          router.push("/"); // Back to home!
        }
      }
    };

    validateConversation();
  }, [conversationId]);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user?.id) {
        console.error(
          "Failed to fetch user ID:",
          error?.message || "No user session found."
        );
        return;
      }
      setUserId(data.session.user.id);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        if (conversationId) {
          setConversationEntries([]);
          const messages = await getMessagesByConversation(conversationId);
          const mappedMessages = messages.map((message) => ({
            userMessage:
              message.sender === "user" ? message.message_text : null,
            aiResponse: message.sender === "ai" ? message.message_text : null,
            loading: false,
          }));
          setConversationEntries(mappedMessages);
        }
      } catch (error: any) {
        console.error("Error fetching messages:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    return () => {
      setConversationEntries([]);
    };
  }, [conversationId]);

  const addUserMessage = async (message: string) => {
    if (!message.trim()) {
      console.error("Message is empty. Cannot process.");
      return;
    }

    if (!userId) {
      console.error(
        "User ID is not available. Cannot create or update a conversation."
      );
      return;
    }

    try {
      let currentConversationId = conversationId;
      let isNewConversation = false;

      // Create a new conversation if none exists.
      if (!currentConversationId) {
        const newConversationId = await createConversation(userId);
        if (!newConversationId) {
          console.error("Failed to create a new conversation.");
          return;
        }
        setConversationId(newConversationId);
        currentConversationId = newConversationId;
        isNewConversation = true;
      }

      // Check if Title is default. If so, update it with the user's message
      if (isNewConversation || (await getConversationById(currentConversationId))?.data?.title === "New Chat") {
        const titleUpdated = await updateConversationTitle(currentConversationId, message);
        if (!titleUpdated.success) {
          console.warn("Failed to update the conversation title.");
        }
      }

      // Save the usermessage to DB
      const userMessageSaved = await saveMessageToDatabase(
        currentConversationId,
        "user",
        message
      );
      if (!userMessageSaved) {
        console.error("Failed to save user message to the database.");
        return;
      }

      // Add the user's message to the local state
      const newEntry: ConversationEntry = {
        userMessage: message,
        aiResponse: null,
        loading: true,
      };
      setConversationEntries((prev) => [...prev, newEntry]);

      const messagesForApi = [
        {
          role: "system",
          content: openAiInstructions.content,
        },
        ...conversationEntries.map((entry) =>
          entry.userMessage
            ? { role: "user", content: entry.userMessage }
            : { role: "assistant", content: entry.aiResponse || "" }
        ),
        { role: "user", content: message },
      ];
  
      // Get AI response
      const aiResponse = await analyzeCode(messagesForApi);

      // Save the Response to DB
      const aiResponseSaved = await saveMessageToDatabase(
        currentConversationId,
        "ai",
        aiResponse
      );
      if (aiResponseSaved) {
        // Step 7: Update local state
        setConversationEntries((prev) =>
          prev.map((entry, index) =>
            index === prev.length - 1
              ? { ...entry, aiResponse, loading: false }
              : entry
          )
        );
      } else {
        console.error("Failed to save AI response to the database.");
      }

      // Redirect after both the user's message and AI response are saved
      if (isNewConversation) {
        router.push(`/sessions/${currentConversationId}`);
      }
    } catch (error: any) {
      console.error("Error in addUserMessage:", error.message);
    } 
  };

  if (
    !conversationEntries ||
    (conversationEntries.length === 0 && !isLoading)
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex flex-col w-full gap-8">
          <Introduction />
          <CodeInput onSubmitMessage={addUserMessage} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={styles.conversationContainer}>
      <div style={styles.messagesContainer}>
        {conversationEntries
          .filter((entry) => entry.userMessage || entry.aiResponse)
          .map((entry, index) => (
            <React.Fragment key={index}>
              {entry.userMessage && <UserMessage code={entry.userMessage} />}
              <Response response={entry.aiResponse} isLoading={entry.loading} />
            </React.Fragment>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <CodeInput onSubmitMessage={addUserMessage} />
    </div>
  );
};

export default AuthenticatedConversation;