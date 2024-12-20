export const analyzeCode = async (messages: { role: string; content: string }[]) => {
  try {
    const response = await fetch("/api/analyzeCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }), // Pass the full conversation history
    });

    const data = await response.json();
    return data.response || "No response from the debug duck!";
  } catch (error: any) {
    console.error("Error analyzing code:", error);
    return "There was an error analyzing the code.";
  }
};