"use client";
import React, { useState } from "react";
import IconButton from "@mui/joy/IconButton";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import Textarea from "@mui/joy/Textarea";
import MicIcon from "@mui/icons-material/Mic";
import { AudioDevices } from "../../utils/recorder";
import { styles } from "../styles/styles";

const audioDevices = new AudioDevices();

interface CodeInputProps {
  onSubmitMessage: (message: string) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ onSubmitMessage }) => {
  const [input, setInput] = useState<string>("");


  const handleMicrophoneClick = async () => {
    const stream = await audioDevices.getUserMedia({ audio: true });
    if (stream) {
      console.log("Microphone activated:", stream);
    } else {
      console.error("Failed to get audio stream");
    }
  };

  const handleSubmit = () => {
    onSubmitMessage(input);
    setInput("");
  };

  return (
    <div style={styles.textAreaContainer}>
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
          '--Textarea-focusedInset': 'var(--any, )',
          '--Textarea-focusedThickness': '0.25rem',
          '--Textarea-focusedHighlight': 'rgba(13,110,253,.25)',
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton
          aria-label="Use microphone"
          onClick={handleMicrophoneClick}
          title="Use microphone"
        >
          <MicIcon />
        </IconButton>

        <IconButton
          aria-label="Submit code"
          onClick={handleSubmit}
          title="Submit code"
          sx={{backgroundColor:"#FF5E6EC"}}
          
        >
          <ArrowUpwardIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default CodeInput;
