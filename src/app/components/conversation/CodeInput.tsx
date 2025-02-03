"use client";
import React, { useState, useRef } from "react";
import IconButton from "@mui/joy/IconButton";
import Textarea from "@mui/joy/Textarea";
import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";
import { AudioDevices } from "../../../utils/recorder";
import { styles } from "../../styles/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { Chip, Stack } from "@mui/material";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const audioDevices = new AudioDevices();

interface CodeInputProps {
  onSubmitMessage: (
    message: string,
    files: { file: File; content: string }[]
  ) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ onSubmitMessage }) => {
  const [input, setInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<{ file: File; content: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

  const ALLOWED_EXTENSIONS = [
    ".txt",
    ".js",
    ".py",
    ".java",
    ".html",
    ".c",
    ".cpp",
    ".cs",
    ".php",
    ".rb",
    ".swift",
    ".m",
    ".ts",
    ".go",
    ".kt",
    ".css",
    ".json",
    ".tsx",
    ".jsx",
  ];

  const ALLOWED_MIME_TYPES = [
    "text/plain",
    "application/javascript",
    "text/x-python",
    "text/x-java-source",
    "text/html",
    "text/x-c",
    "text/x-c++",
    "text/x-csharp",
    "text/x-php",
    "text/x-ruby",
    "text/x-swift",
    "text/x-objectivec",
    "text/x-go",
    "text/x-kotlin",
    "text/css",
    "application/json",
    "text/typescript",
    "text/jsx",
    "text/tsx",
  ];

  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleMicrophoneClick = async () => {
    const stream = await audioDevices.getUserMedia({ audio: true });
    if (stream) {
      console.log("Microphone activated:", stream);
    } else {
      console.error("Failed to get audio stream");
    }
  };

  const handleSubmitMessage = () => {
    if (input.trim() === "" && files.length === 0) {
      return;
    }

    // 🔹 Pass raw file objects (not formatted content)
    onSubmitMessage(input.trim(), files);

    // 🔹 Clear input and file state
    setInput("");
    setFiles([]);
  };

  const handleDeleteFile = (fileToDelete: File) => {
    setFiles((prevFiles) =>
      prevFiles.filter((file) => file.file !== fileToDelete)
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    Array.from(files).forEach((file) => {
      const fileExtension = file.name
        .slice(file.name.lastIndexOf("."))
        .toLowerCase();

      const isAllowedFile =
        ALLOWED_EXTENSIONS.includes(fileExtension) ||
        (file.type && ALLOWED_MIME_TYPES.includes(file.type));

      if (!isAllowedFile) {
        setError(
          `File ${file.name} is not supported. Please upload a valid file.`
        );
        setOpen(true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;

        if (file.size > MAX_FILE_SIZE) {
          setError(`File ${file.name} is too large. Max file size is 5MB.`);
          return;
        }
        setFiles((prevFiles) => [...prevFiles, { file, content: fileContent }]);
      };
      reader.readAsText(file);

      reader.onerror = () => {
        console.error("Error reading file.");
        setError("Error reading file.");
        setOpen(true);
      };
    });
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div style={styles.textAreaContainer}>
      {files.length > 0 && (
        <Stack direction="row" spacing={1} style={{ marginBottom: "8px" }}>
          {files.map((file, index) => (
            <Chip
              key={index}
              label={file.file.name}
              onDelete={() => handleDeleteFile(file.file)}
            />
          ))}
        </Stack>
      )}

      <Textarea
        id="code"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        color="neutral"
        disabled={false}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents a new line from being added
            handleSubmitMessage();
          }
        }}
        minRows={1}
        maxRows={4}
        aria-label="Text area for code input"
        placeholder="Paste your code here..."
        size="md"
        variant="plain"
        style={styles.textAreaStyle}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="flex flex-row gap-1">
          <IconButton
            aria-label="Use microphone"
            onClick={handleMicrophoneClick}
            title="Use microphone"
          >
            <MicIcon />
          </IconButton>
          <IconButton aria-label="Open file picker" onClick={openFilePicker}>
            <AttachFileIcon />
          </IconButton>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>

        <IconButton
          aria-label="Submit code"
          onClick={handleSubmitMessage}
          type="submit"
          title="Submit code"
          sx={{ backgroundColor: "#FF5E6EC" }}
        >
          <SendIcon />
        </IconButton>
      </div>
      {error && (
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </div>
  );
};

export default CodeInput;
