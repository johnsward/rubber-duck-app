import { useState, useEffect, useRef, useMemo } from "react";
import { initializeSSE, closeSSE } from "@/app/services/sseService";
import { getFileLanguage, openAiInstructions } from "@/utils/openAiHelpers";

interface ConversationEntry {
  userMessage: string;
  aiResponse: string | null;
  loading: boolean;
}

export const useLocalConversation = () => {
  const initialConversationEntries = useMemo(() => {
    return JSON.parse(localStorage.getItem("conversationEntries") || "[]");
  }, []);

  const [conversationEntries, setConversationEntries] = useState<
    ConversationEntry[]
  >(initialConversationEntries);
  const activeSSERef = useRef<boolean>(false);

  // ✅ Load messages from local storage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem("conversationEntries");
    if (storedEntries) {
      setConversationEntries(JSON.parse(storedEntries));
    }
  }, []);


  // Handles SSE connection for the latest message
  const initializeSSEForUnansweredMessage = (messagesForApi: any[]) => {
    if (activeSSERef.current) {
      return;
    }
    activeSSERef.current = true;

    let accumulatedResponse = "";

    const handleMessage = (message: any) => {
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

    initializeSSE(
      [
        { role: "system", content: openAiInstructions.content },
        ...messagesForApi,
      ],
      handleMessage,
      handleError,
      handleComplete
    );
  };
  
  const processMessage = async (message: string, files: { file: File; content: string }[]) => {
    if (!message.trim() && files.length === 0) return;
  
    // ✅ Format files into readable code blocks
    const formattedFiles = files
      .map(({ file, content }) => `📂 **${file.name}**\n\`\`\`${getFileLanguage(file.name)}\n${content}\n\`\`\``)
      .join("\n\n");
  
    // ✅ Merge user message + files into a single structured entry
    const finalMessage = message.trim() && formattedFiles
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
      localStorage.setItem("conversationEntries", JSON.stringify(updatedEntries));
      return updatedEntries;
    });
  
    // ✅ Fetch the full conversation from localStorage
    const storedEntries = JSON.parse(localStorage.getItem("conversationEntries") || "[]");
  
    // ✅ Convert conversation history into OpenAI API format
    const messagesForApi = storedEntries.map((entry: ConversationEntry) => ({
      role: "user",
      content: entry.userMessage,
    }));
  
    initializeSSEForUnansweredMessage(messagesForApi);
  };

  return { conversationEntries, processMessage };
};
