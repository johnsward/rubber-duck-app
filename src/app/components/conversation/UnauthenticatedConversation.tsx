"use client";

import React, { useEffect, useRef } from "react";
import { UserMessage } from "./UserMessage";
import Response from "./Response";
import CodeInput from "./CodeInput";
import { styles } from "../../styles/styles";
import { Introduction } from "../Introduction";
import { useLocalConversation } from "@/app/hooks/useLocalConversation";

const UnauthenticatedConversation: React.FC = () => {
  const { conversationEntries, processMessage } = useLocalConversation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationEntries]);

  useEffect(() => {
    localStorage.setItem(
      "conversationEntries",
      JSON.stringify(conversationEntries)
    );
  }, [conversationEntries]);

  if (conversationEntries.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex flex-col w-full gap-8">
          <Introduction />
          <CodeInput onSubmitMessage={processMessage} />
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
            <Response response={entry.aiResponse} isLoading={entry.loading} />
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <CodeInput onSubmitMessage={processMessage} />
    </div>
  );
};

export default UnauthenticatedConversation;
