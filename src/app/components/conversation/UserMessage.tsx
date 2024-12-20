import React from "react";
import { styles } from "../../styles/styles";

interface UserMessageProps {
  code: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ code }) => {
  return (
    <div className="flex justify-center w-full">
      <div className="flex w-[800px] items-center justify-end">
        <div style={styles.userMessageStyle}>
          <div className="flex items-center w-full justify-center">
            <p className="text-primaryColor text-sm">{code}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
