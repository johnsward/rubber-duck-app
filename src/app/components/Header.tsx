import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Avatar,
  Backdrop,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
// import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
// import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { NavigationMenuComponent } from "./NavigationMenu";
import { styles } from "../styles/styles";
import { fetchUserInitials } from "@/utils/fetchUserDetails";
import { supabase } from "@/lib/supabaseClient";
import LogoutIcon from "@mui/icons-material/Logout";
import CreateIcon from "@mui/icons-material/Create";
import { createNewChat } from "../../utils/conversationHelpers";
import { useRouter } from "next/navigation";

interface HeaderProps {
  isSidebarCollapsed: boolean;
  isLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarCollapsed,
  isLoggedIn,
}) => {
  // const [isLightMode, setIsLightMode] = useState(true);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loadingNewChat, setLoadingNewChat] = useState<boolean>(false);
  const [loadingLogout, setLoadingLogout] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const getUserInitials = async () => {
      try {
        if (isLoggedIn) {
          const initials = await fetchUserInitials();
          setUserInitials(initials);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Failed to fetch initials", error.message);
          setUserInitials("");
        }
      }
    };
    getUserInitials();
  }, [isLoggedIn]);

  // const handleThemeToggle = () => {
  //   setIsLightMode(!isLightMode);
  // };

  const handleLogout = async () => {
    setLoadingLogout(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("conversationEntries");
      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Couldn't sign out:", error.message);
        alert("An error occurred while logging out. Please try again.");
      }
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleNewChat = async () => {
    setLoadingNewChat(true);
    if (!isLoggedIn) {
      handleLocalConversation();
      setLoadingNewChat(false);
      return;
    }
    try {
      const conversationId = await createNewChat(undefined, (id) =>
        router.push(`/sessions/${id}`)
      );
      if (!conversationId) {
        console.error("Failed to create a new chat");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating new chat:", error.message);
      }
    } finally {
      setLoadingNewChat(false);
    }
  };

  const handleLocalConversation = () => {
    const existingEntries = localStorage.getItem("conversationEntries");
    if (existingEntries) {
      setIsDialogOpen(true); // Prompt user to confirm overwriting
    } else {
      localStorage.setItem("conversationEntries", JSON.stringify([])); // Start a new local conversation
    }
  };

  const handleDialogClose = (confirm: boolean) => {
    setIsDialogOpen(false);
    if (confirm) {
      localStorage.removeItem("conversationEntries");
      window.location.reload();
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <header
      className="fixed top-0 left-0 h-16 flex items-center justify-between transition-all duration-300"
      style={
        isSidebarCollapsed
          ? styles.collapsedHeaderContainer
          : styles.extendedHeaderContainer
      }
    >
      {loadingNewChat && <Backdrop open={loadingNewChat} />}
      <div className="flex ml-12 flex-row gap-2 items-center justify-between h-16 w-full p-4">
        <div className="flex items-center justify-center gap-4">
          <IconButton
            sx={{ backgroundColor: "#ffffff" }}
            className="shadow-sm"
            onClick={handleNewChat}
          >
            {loadingNewChat ? <CircularProgress size={20} /> : <CreateIcon />}
          </IconButton>
          <NavigationMenuComponent />
        </div>
        <div className="flex flex-row items-center gap-2">
          {isLoggedIn ? (
            <>
              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#3f51b5",
                    fontSize: 14,
                  }}
                >
                  {userInitials}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                style={{ marginTop: 4 }}
              >
                <MenuItem onClick={handleLogout}>
                  {loadingLogout ? (
                    <CircularProgress size={20} />
                  ) : (
                    <>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      Log Out
                    </>
                  )}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <div className="flex flex-row gap-2">
              <Button
                size="lg"
                variant="default"
                onClick={() => router.push("/auth")}
              >
                Log in
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push("/auth/register")}
              >
                Register
              </Button>
            </div>
          )}
        </div>
        <Dialog open={isDialogOpen} onClose={() => handleDialogClose(false)}>
          <DialogTitle>Discard Current Chat?</DialogTitle>
          <DialogContent>
            Creating a new chat will discard your latest chat. Are you sure you
            want to continue?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDialogClose(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={() => handleDialogClose(true)} color="secondary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
