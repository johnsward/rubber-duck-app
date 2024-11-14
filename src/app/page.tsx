// Home.tsx
"use client";
import React from "react";
import RubberDuck from "./components/RubberDuck";
import DockMenu from "./components/DockMenu";
import { Conversation } from "./components/Conversation";
import { styles } from "./styles/styles";

export default function Home() {
  return (
    <div style={styles.pageContainer}>
      {/* Top Fixed Section (e.g., RubberDuck) */}


      {/* Scrollable Conversation Section */}
      <div style={styles.conversationContainer}>
        <Conversation />
      </div>

      {/* Fixed Dock Menu at the Bottom */}
      <div className="fixed bottom-0 w-full">
        <DockMenu />
      </div>
    </div>
  );
}