import React from "react";
import { styles } from "../styles/styles";

interface UserMessageProps {
  code: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ code }) => {
  return (
    <div style={styles.userMessageStyle}>
      <p className="text-primaryColor text-sm">{code}</p>
    </div>
  );
};