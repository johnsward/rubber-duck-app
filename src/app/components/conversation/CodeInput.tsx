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

const audioDevices = new AudioDevices();

interface CodeInputProps {
  onSubmitMessage: (message: string, files: File[]) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ onSubmitMessage }) => {
  const [input, setInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleMicrophoneClick = async () => {
    const stream = await audioDevices.getUserMedia({ audio: true });
    if (stream) {
      console.log("Microphone activated:", stream);
    } else {
      console.error("Failed to get audio stream");
    }
  };

  const handleSubmitMessage = () => {
    onSubmitMessage(input, files);
    setInput("");
    setFiles([]);
  };

  const handleDeleteFile = (fileToDelete: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToDelete));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(selectedFiles)]);
      console.log("Files uploaded:", Array.from(selectedFiles));
    }
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
              label={file.name}
              onDelete={() => handleDeleteFile(file)}
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
        minRows={1}
        maxRows={4}
        placeholder="Paste your code here..."
        size="md"
        variant="plain"
        style={styles.textAreaStyle}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:focus, &:focus-within": {
              outline: "none", 
              border: "none",
              boxShadow: "none", 
            },
          },
        }}
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
          <IconButton onClick={openFilePicker}>
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
          title="Submit code"
          sx={{ backgroundColor: "#FF5E6EC" }}
        >
          <SendIcon />
        </IconButton>
      </div>
      </div>
  );
};

export default CodeInput;
