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
import { UserMessage } from "./UserMessage";
import Response from "./Response";
import CodeInput from "./CodeInput";
import { styles } from "../../styles/styles";
import { CircularProgress } from "@mui/material";
import { Introduction } from "../Introduction";
import { useConversation } from "@/app/hooks/conversationHooks";

interface AuthenticatedConversationProps {
  conversationId?: string;
  initialMessage?: string;
}

const AuthenticatedConversation: React.FC<AuthenticatedConversationProps> = ({
  conversationId: initialConversationId,
}) => {
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );

  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { isLoading, setLoading } = useLoading();
  const [pendingMessage, setPendingMessage] = useState<string | null>();
  const router = useRouter();
  
  const { conversationEntries, processMessage } = useConversation(
    conversationId,
    pendingMessage!,
    setPendingMessage
  );


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationEntries]);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user?.id) {
        console.error("Failed to fetch user ID:", error?.message);
        return;
      }
      setUserId(data.session.user.id);
    };

    fetchUserId();
  }, []);


  const addUserMessage = async (message: string) => {
    if (!message.trim()) {
      console.error("Message is empty. Cannot process.");
      return;
    }

    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    try {
      if (!conversationId) {
        const newConversationId = await createConversation(userId);
        if (!newConversationId) {
          console.error("Failed to create a new conversation.");
          return;
        }
        setPendingMessage(message); // Process message after redirect
        router.push(`/sessions/${newConversationId}`);
        setConversationId(newConversationId);
        await updateConversationTitle(newConversationId, message);
        return;
      }

      const conversation = await getConversationById(conversationId);
      
      if (conversation.data?.title == 'New Chat') {
        await updateConversationTitle(conversationId, message);
      }
      processMessage(conversationId, message);
    } catch (error) {
      console.error("Error in addUserMessage:", error);
    }
  };

  if (
    !conversationEntries || 
    (conversationEntries.length === 0 && !isLoading && !pendingMessage)
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
      {isLoading ? (
        <div className="flex w-full h-screen items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <div style={styles.messagesContainer}>
            {conversationEntries.map((entry, index) => (
              <React.Fragment key={index}>
                {entry.userMessage && <UserMessage code={entry.userMessage} />}
                <Response
                  response={entry.aiResponse}
                  isLoading={entry.loading}
                />
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <CodeInput onSubmitMessage={addUserMessage} />
        </>
      )}
    </div>
  );
};

export default AuthenticatedConversation;
