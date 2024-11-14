import React, { useState, useEffect, useRef } from "react";
import { UserMessage } from "./UserMessage";
import Response from "./Response";
import CodeInput from "./CodeInput";
import { styles } from "../styles/styles";
import { analyzeCode } from "./CodeAnalyzer";
import { Introduction } from "./Introduction";

interface ConversationEntry {
  userMessage: string;
  aiResponse: string | null;
}

export const Conversation: React.FC = ({}) => {
  const [conversationEntries, setConversationEntries] = useState<
    ConversationEntry[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedConversation = localStorage.getItem("conversationEntries");

    if (storedConversation) {
      setConversationEntries(JSON.parse(storedConversation));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "conversationEntries",
      JSON.stringify(conversationEntries)
    );
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationEntries]);

  const addUserMessage = async (newMessage: string) => {
    if (newMessage == "" || newMessage == null ) {
        return null;
    }
    const newEntry: ConversationEntry = {
      userMessage: newMessage,
      aiResponse: null,
    };
    setConversationEntries((prevEntries) => [...prevEntries, newEntry]);

    const response = await getAiResponse(newMessage);
    setConversationEntries((prevEntries: ConversationEntry[]) => (prevEntries.map((entry, index) =>
        index === prevEntries.length - 1 ? {...entry, aiResponse: response} : entry
    )))
  };

  const getAiResponse = async (message: string): Promise<string> => {
    if (conversationEntries.length === 0) {
      return "This code looks exciting! Use your microphone or type your explanation, and I'll respond once you're finished.";
    }
    return await analyzeCode(message);
  };

  if (conversationEntries.length == 0) {
    return (
      <div style={styles.startPage}>
      <Introduction />
      <CodeInput onSubmitMessage={addUserMessage} />
      </div>
    )
  }

  return (
    <div style={styles.conversationContainer}>
      <div style={styles.messagesContainer}>
        <div style={styles.messagesContainerStyle}>
          {conversationEntries.map((message, index) => (
            <React.Fragment key={index}>
              <div className="flex justify-end w-full">
                <UserMessage code={message.userMessage} />
              </div>

              <div className="flex justify-start w-full">
                <Response response={message.aiResponse} />
              </div>
            </React.Fragment>
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>
      <CodeInput onSubmitMessage={addUserMessage} />
    </div>
  );
};
