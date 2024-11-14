export const analyzeCode = async (code: string) => {
  try {
    const response = await fetch("/api/analyzeCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    return data.response || "No response from the debug duck!";
  } catch (error: any) {
    if (error.code === "insufficient_quota") {
      return "Quota exceeded. Please try again later or check your plan limits.";
    }
    console.error("Error analyzing code:", error);
    return "There was an error analyzing the code.";
  }
};
