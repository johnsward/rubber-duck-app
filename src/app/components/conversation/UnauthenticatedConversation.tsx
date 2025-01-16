"use client";

import React, { useEffect, useState, useRef } from "react";
import { UserMessage } from "./UserMessage";
import Response from "./Response";
import CodeInput from "./CodeInput";
import { styles } from "../../styles/styles";
import { openAiInstructions } from "@/utils/openAiHelpers";
import { Introduction } from "../Introduction";

interface ConversationEntry {
  userMessage: string;
  aiResponse: string | null;
}

const UnauthenticatedConversation: React.FC = () => {
  const [conversationEntries, setConversationEntries] = useState<
    ConversationEntry[]
  >([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationEntries]);

  useEffect(() => {
    const storedEntries = JSON.parse(
      localStorage.getItem("conversationEntries") || "[]"
    );
    setConversationEntries(storedEntries);
    setIsInitialized(true); // Set initialized after loading
  }, []);

  // Sync conversationEntries with localStorage whenever it changes, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(
        "conversationEntries",
        JSON.stringify(conversationEntries)
      );
    }
  }, [conversationEntries, isInitialized]);

  const addUserMessage = async (message: string) => {
    if (!message.trim()) {
      console.error("Message is empty. Cannot process.");
      return;
    }

    setIsLoading(true);

    const newEntry: ConversationEntry = {
      userMessage: message,
      aiResponse: null,
    };

    // Add the user's message to the state and localStorage immediately
    setConversationEntries((prev) => [...prev, newEntry]);

    try {
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

      const eventSource = new EventSource(
        `/api/analyzeCode?messages=${encodeURIComponent(
          JSON.stringify(messagesForApi)
        )}`
      );

      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          eventSource.close();
          setIsLoading(false);
          return;
        }

        // Append AI response to the last entry
        setConversationEntries((prev) =>
          prev.map((entry, index) =>
            index === prev.length - 1
              ? { ...entry, aiResponse: (entry.aiResponse || "") + event.data }
              : entry
          )
        );
      };

      eventSource.onerror = (error) => {
        console.error("SSE Error:", error);
        eventSource.close();
        setIsLoading(false);
      };
    } catch (error: any) {
      console.error("Error in local addUserMessage:", error.message);
    }
  };

  if (!conversationEntries || conversationEntries.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex flex-col w-full gap-8">
          <Introduction />
          <CodeInput onSubmitMessage={addUserMessage} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.conversationContainer}>
      <div style={styles.messagesContainer}>
        {conversationEntries.map((entry, index) => (
          <React.Fragment key={index}>
            <UserMessage code={entry.userMessage} />
            <Response response={entry.aiResponse} isLoading={isLoading} />
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <CodeInput onSubmitMessage={addUserMessage} />
    </div>
  );
};

export default UnauthenticatedConversation;