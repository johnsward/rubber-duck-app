import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { styles } from "../../styles/styles";
import IconButton from "@mui/joy/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import { Alert} from "@mui/material";
import RubberDuck from "../RubberDuck";

interface ResponseProps {
  response: string | null;
  isLoading: boolean; 
}

const Response: React.FC<ResponseProps> = ({ response, isLoading }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```|`([^`]+)`/g;

  if (isLoading) {
    return (
      <div className="flex justify-center w-full">
        <div className="flex w-[880px] items-start">
          {/* Rubber Duck - Always Visible */}
          <RubberDuck width={40} height={40} isAnimated={isLoading} />

          <div style={styles.responseMessageStyle}>
            <span className="loading loading-dots loading-sm text-blue-300"></span>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return null; 
  }

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setOpen(true);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(response || ""))) {
    const [fullMatch, language, blockCode, inlineCode] = match;

    const textBeforeCode = response?.slice(lastIndex, match.index);
    if (textBeforeCode) {
      parts.push({ type: "text", content: textBeforeCode });
    }

    if (blockCode) {
      parts.push({ type: "code", content: blockCode, language: language || "text" });
    } else if (inlineCode) {
      parts.push({ type: "code", content: inlineCode, language: "text" });
    }

    lastIndex = match.index + fullMatch.length;
  }

  // Push any remaining text after the last code block
  if (response && lastIndex < response.length) {
    parts.push({ type: "text", content: response.slice(lastIndex) });
  }

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-[880px] items-start">
        {/* Rubber Duck - Always Visible */}
        <RubberDuck width={40} height={40} isAnimated={false} />

        <div style={styles.responseMessageStyle}>
          {parts.map((part, index) =>
            part.type === "code" ? (
              <div
                key={index}
                style={{ position: "relative", marginBottom: "1em", fontSize: "14px" }}
              >
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={part.language}
                  className="text-sm rounded-md"
                >
                  {part.content}
                </SyntaxHighlighter>
                <IconButton
                  onClick={() => handleCopy(part.content, index)}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    color: "#fff",
                    backgroundColor: "#242424",
                  }}
                  sx={{ "--IconButton-size": "24px" }}
                >
                  {copiedIndex === index ? (
                    <ContentPasteIcon style={{ width: 12, height: 12 }} />
                  ) : (
                    <ContentCopyIcon style={{ width: 12, height: 12 }} />
                  )}
                </IconButton>
              </div>
            ) : (
              <ReactMarkdown
                key={index}
                components={{
                  p: ({ children }) => (
                    <p className="text-primaryColor text-sm">{children}</p>
                  ),
                }}
              >
                {part.content}
              </ReactMarkdown>
            )
          )}
        </div>

        {/* Snackbar for "Copied to Clipboard" */}
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            Copied to clipboard!
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Response;
