import React from "react";
import { styles } from "../styles/styles";
import RubberDuck from "./RubberDuck";

export const Introduction: React.FC = () => {
  return (
    <div style={styles.introductionContainer}>
      <RubberDuck width={160} height={160} isAnimated={true} />
      <div className="flex flex-col items-center justify-center p-4 gap-6">
        <h1 style={styles.greeting}>Hello, Friend</h1>
        <h1 style={styles.introductionQuestion}>Anything to debug?</h1>
        <p style={styles.introductionDescription}>
          Paste your code down below and start debugging! You can either use
          your keyboard or your microphone. The choice is yours!
        </p>
      </div>
    </div>
  );
};
