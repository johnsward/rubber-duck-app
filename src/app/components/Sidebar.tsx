import React, { useState } from "react";
import { styles } from "../styles/styles";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import { IconButton } from "@mui/material";
import { Button } from "./ui/button";
import { Collapse } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { ConversationsList } from "./ConversationsList";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onRegister: () => void;
  selectedConversationId: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  toggleSidebar,
  isLoggedIn,
  onLogin,
  onRegister,
  selectedConversationId,
}) => {
  return (
    <div
      style={
        isCollapsed
          ? styles.collapsedSidebarContainer
          : styles.extendedSidebarContainer
      }
    >
      <div style={styles.sidebarHeader}>
        <IconButton onClick={toggleSidebar}>
          <ViewSidebarIcon />
        </IconButton>
        {!isCollapsed && (
          <IconButton onClick={() => {}}>
            <SearchIcon />
          </IconButton>
        )}
      </div>

      <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
        {!isLoggedIn ? (
          <div className="flex items-center flex-col h-full w-full p-4 gap-4">
            <div className="flex flex-col gap-4">
              <h1 style={styles.lightText}>Psst...</h1>
              <h1 style={styles.darkText}>
                You're gonna have to log in to see your sessions!
              </h1>
            </div>
            <div className="flex flex-col gap-2 w-full h-full align-middle justify-center">
              <Button variant="default" color="primary" onClick={() => onLogin}>
                Log in
              </Button>
              <Button
                variant="outline"
                color="secondary"
                onClick={() => onRegister}
              >
                Register
              </Button>
            </div>
          </div>
        ) : (
          <ConversationsList selectedConversationId={selectedConversationId} />
        )}
      </Collapse>
    </div>
  );
};
