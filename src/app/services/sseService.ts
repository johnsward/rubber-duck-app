let eventSource: EventSource | null = null;

export const initializeSSE = (
  identifier: string | any[],
  onMessage: (message: any) => void,
  onError: () => void,
  onComplete: () => void
): (() => void) => {
  if (eventSource) {
    return closeSSE;
  }

  let url = "";
  let body = null;
  let method = "GET";

  if (typeof identifier === "string") {
    // ✅ Authenticated user: Use GET
    url = `/api/analyzeCode?conversationId=${identifier}`;
  } else if (Array.isArray(identifier)) {
    // ✅ Unauthenticated user: Use POST (sending messages)
    url = "/api/analyzeCode";
    body = JSON.stringify({ messages: identifier });
    method = "POST";
  } else {
    console.error("Invalid identifier type for SSE:", typeof identifier);
    onError();
    return () => {};
  }

  if (method === "GET") {
    /** ✅ For authenticated users, use EventSource */
    eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        onComplete();
        closeSSE();
        return;
      }

      try {
        const parsedData = JSON.parse(event.data);
        onMessage(parsedData);
      } catch (error: any) {
        console.error("Error parsing SSE message:", error.message);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      onError();
      closeSSE();
    };
  } else {
    /** ✅ For unauthenticated users, use Fetch + ReadableStream */
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    })
      .then((response) => response.body?.getReader())
      .then((reader) => {
        if (!reader) return;

        const decoder = new TextDecoder();
        let accumulatedResponse = "";

        const readStream = async () => {
          let partialChunk = ""; // Buffer for incomplete JSON chunks
        
          while (true) {
            const { value, done } = await reader.read();
            if (done) break; // Stop reading when finished
        
            const chunk = decoder.decode(value, { stream: true });
        
            // ✅ Ensure last message is processed before completing
            if (chunk.includes("[DONE]")) {
              console.log("✅ SSE Complete. Final response stored.");
              return onComplete();
            }
        
            partialChunk += chunk; 
            const messages = partialChunk.trim().split("\n\n"); 
        
            messages.forEach((msg) => {
              try {
                if (!msg.startsWith("data:")) return; // Skip invalid messages
        
                const jsonContent = msg.replace(/^data:\s*/, ""); // ✅ Safe removal of "data: "
                const parsedData = JSON.parse(jsonContent);
        
                accumulatedResponse += parsedData.content;
                onMessage(parsedData);
        
                // ✅ Reset buffer only after successful JSON parse
                partialChunk = ""; 
              } catch (error) {
                console.warn("⚠️ Waiting for full JSON chunk...");
              }
            });
          }
        };

        readStream();
      })
      .catch((error) => {
        console.error("Error starting SSE stream:", error);
        onError();
      });
  }

  return () => {
    closeSSE();
  };
};

export const closeSSE = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
};
