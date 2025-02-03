"use client";

import { useState, useEffect, useRef } from "react";
import { initializeSSE } from "@/app/services/sseService";
import { getFileLanguage, openAiInstructions } from "@/utils/openAiHelpers";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

interface ConversationEntry {
  userMessage: string;
  aiResponse: string | null;
  loading: boolean;
}

interface SSEMessage {
  content: string;
}

export const useLocalConversation = () => {
  const [conversationEntries, setConversationEntries] = useState<
    ConversationEntry[]
  >([]);

  const activeSSERef = useRef<boolean>(false);

  useEffect(() => {
    // ✅ Ensure this runs only on the client
    const storedEntries =
      typeof window !== "undefined"
        ? localStorage.getItem("conversationEntries")
        : null;
    if (storedEntries) {
      setConversationEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "conversationEntries",
        JSON.stringify(conversationEntries)
      );
    }
  }, [conversationEntries]);

  // Handles SSE connection for the latest message
  const initializeSSEForUnansweredMessage = (
    messagesForApi: ChatCompletionMessageParam[]
  ) => {
    if (activeSSERef.current) {
      return;
    }
    activeSSERef.current = true;

    let accumulatedResponse = "";

    const handleMessage = (message: SSEMessage) => {
      if (message.content) {
        accumulatedResponse += message.content;

        setConversationEntries((prev) => {
          const updatedEntries = prev.map((entry, idx) =>
            idx === prev.length - 1
              ? { ...entry, aiResponse: accumulatedResponse, loading: false }
              : entry
          );

          localStorage.setItem(
            "conversationEntries",
            JSON.stringify(updatedEntries)
          );
          return updatedEntries;
        });
      }
    };

    const handleComplete = () => {
      setConversationEntries((prev) => {
        const updatedEntries = prev.map((entry, idx) =>
          idx === prev.length - 1
            ? { ...entry, aiResponse: accumulatedResponse, loading: false }
            : entry
        );

        localStorage.setItem(
          "conversationEntries",
          JSON.stringify(updatedEntries)
        );
        return updatedEntries;
      });

      activeSSERef.current = false;
    };

    const handleError = () => {
      console.error("❌ SSE connection error.");
      activeSSERef.current = false;
    };

    const messagesForOpenAI: ChatCompletionMessageParam[] = [
      { role: "system", content: openAiInstructions.content },
      ...messagesForApi,
    ];

    initializeSSE(
      messagesForOpenAI,
      handleMessage,
      handleError,
      handleComplete
    );
  };

  const processMessage = async (
    message: string,
    files: { file: File; content: string }[]
  ) => {
    if (!message.trim() && files.length === 0) return;

    // ✅ Format files into readable code blocks
    const formattedFiles = files
      .map(
        ({ file, content }) =>
          `📂 **${file.name}**\n\`\`\`${getFileLanguage(
            file.name
          )}\n${content}\n\`\`\``
      )
      .join("\n\n");

    // ✅ Merge user message + files into a single structured entry
    const finalMessage =
      message.trim() && formattedFiles
        ? `${message.trim()}\n\n---\n${formattedFiles}`
        : message.trim() || formattedFiles; // Use whichever exists

    const newEntry: ConversationEntry = {
      userMessage: finalMessage,
      aiResponse: "",
      loading: true,
    };

    // ✅ Update localStorage + State
    setConversationEntries((prev) => {
      const updatedEntries = [...prev, newEntry];
      localStorage.setItem(
        "conversationEntries",
        JSON.stringify(updatedEntries)
      );
      return updatedEntries;
    });

    // ✅ Fetch the full conversation from localStorage
    let storedEntries: ConversationEntry[] = [];

    if (typeof window !== "undefined") {
      storedEntries = JSON.parse(
        localStorage.getItem("conversationEntries") || "[]"
      );
    }

    const messagesForApi: ChatCompletionMessageParam[] = storedEntries.map(
      (entry: ConversationEntry) => ({
        role: "user",
        content: entry.userMessage,
      })
    ) as ChatCompletionMessageParam[];

    initializeSSEForUnansweredMessage(messagesForApi);
  };

  return { conversationEntries, processMessage };
};
