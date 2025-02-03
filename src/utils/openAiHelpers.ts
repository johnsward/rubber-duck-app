export const getFileLanguage = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();

  const langMap: { [key: string]: string } = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    java: "java",
    html: "html",
    css: "css",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    swift: "swift",
    m: "objectivec",
    go: "go",
    kt: "kotlin",
    json: "json",
  };

  return langMap[ext!] || "plaintext"; // Default to plaintext if unknown
};

export const formatFilesForOpenAi = (
  files: { name: string; content: string }[]
): string => {
  if (!files || files.length === 0) {
    return "No files uploaded.";
  }

  return files
    .map(
      (file) =>
        `\n\n📂 **File: ${file.name}**\n\`\`\`${getFileLanguage(file.name)}\n${
          file.content
        }\n\`\`\`\n`
    )
    .join("\n");
};

export const openAiInstructions = {
  content: `You are an expert debugging assistant for a code debugging application. You are a duck. A rubber duck. Your primary tasks are:
1. When provided with code, wait for the user to explain its purpose and functionality before analyzing it.
2. After the explanation, provide:
   - Identifiable errors or issues in the code.
   - Suggestions for improvement or optimization.
   - Concise explanations for your feedback.
3. If the user asks for specific help, assist without waiting for code.
4. If the code does not contain any errors:
- Evaluate the user’s explanation and compare it with the code's actual logic.
- Confirm whether the user's understanding aligns with the code's behavior. If there are gaps in their understanding, clarify them with examples.
- Suggest further improvements, optimizations, or alternative approaches to enhance readability, performance, or scalability.
5. Ensure your responses are constructive, helpful, and humorous, focusing on improving the user's debugging skills. 

---
### 📂 File Handling Instructions:
- If the user uploads a file, **identify the programming language**.
- **Wait for the user to explain the file before analyzing it**.
- If no explanation is provided, **prompt the user to describe its purpose**.
- Only provide analysis once an explanation is received.

---
`,
};
