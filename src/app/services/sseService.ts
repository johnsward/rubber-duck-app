let eventSource: EventSource | null = null;
let accumulatedData = ""; // Buffer to accumulate partial JSON messages
let retryTimeout = 1000; // Start retry timeout at 1 second
const maxRetryTimeout = 60000; // Cap retries at 60 seconds

export const initializeSSE = (
    conversationId: string,
    onMessage: (message: any) => void,
    onError: () => void,
    onComplete: () => void
  ): (() => void) => {
    if (eventSource) {
      return closeSSE;
    }
  
    console.log(`Initializing SSE for conversationId: ${conversationId}`);
    eventSource = new EventSource(
      `/api/analyzeCode?conversationId=${conversationId}`
    );
  
    eventSource.onmessage = (event) => {
      const data = event.data.trim();
  
      if (data === "[DONE]") {
        onComplete(); // Call completion callback
        closeSSE(); // Close the SSE connection
        return;
      }
  
      try {
        accumulatedData += data;
        const parsedData = JSON.parse(accumulatedData);
        onMessage(parsedData);
        accumulatedData = ""; // Clear the buffer on success
      } catch (err) {
        // If parsing fails, retain accumulated data for the next chunk
        console.warn("Non-JSON message fragment received, waiting for more data:", data);
      }
    };
  
    eventSource.onerror = () => {
      console.error("SSE connection error.");
      onError();
      closeSSE();
    };
  
    return closeSSE;
  };

export const closeSSE = () => {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
    accumulatedData = ""; // Clear any buffered data
    retryTimeout = 1000; // Reset retry timeout
  }
};
