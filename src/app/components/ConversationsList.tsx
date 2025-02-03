import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  IconButton,
  MenuItem,
  Menu,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  SnackbarCloseReason,
} from "@mui/material";
import { CircularProgress } from "@mui/material";
import { getConversationsByUser } from "../api/dbQueries";
import { getUserId } from "@/utils/conversationHelpers";
import { styles } from "../styles/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteConversation } from "@/utils/conversationHelpers";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { closeSSE } from "../services/sseService";

interface Conversation {
  conversation_id: string;
  title: string;
  created_at: string;
}

interface ConversationsListProps {
  selectedConversationId: string | null;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  selectedConversationId,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [itemToBeDeleted, setItemToBeDeleted] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const userId = await getUserId();
        if (userId) {
          const conversationList = await getConversationsByUser(userId);
          setConversations(conversationList);
        }
      } catch (error: any) {
        console.error("Error fetching conversations:", error.message);
        setOpen(true);
        setSnackbarMessage("Failed to fetch conversations.");
        setSnackbarSeverity("error");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    const subscription = supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          console.log("Real time payload:", payload);

          if (payload.eventType === "INSERT") {
            setConversations((prev) => [
              {
                conversation_id: payload.new.conversation_id,
                title: payload.new.title || "Untitled Conversation", // Default title if none provided
                created_at: payload.new.created_at || new Date().toISOString(), // Default timestamp
              },
              ...prev,
            ]);
          } else if (payload.eventType === "DELETE") {
            setConversations((prev) =>
              prev.filter(
                (conv) => conv.conversation_id !== payload.old.conversation_id
              )
            );
          } else if (payload.eventType === "UPDATE") {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.conversation_id === payload.new.conversation_id
                  ? {
                      conversation_id: payload.new.conversation_id,
                      title: payload.new.title || "Untitled Conversation",
                      created_at:
                        payload.new.created_at || new Date().toISOString(),
                    }
                  : conv
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    conversationId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setItemToBeDeleted(conversationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    if (!itemToBeDeleted) {
      setOpen(true);
      setSnackbarMessage("No conversation selected for deletion.");
      setSnackbarSeverity("error");
      return;
    }

    try {
      setIsDialogOpen(false);
      const { success, error } = await deleteConversation(itemToBeDeleted!);

      if (!success) {
        console.error("Failed to delete conversation:", error);
        setSnackbarMessage("Failed to delete conversation. Please try again.");
        setSnackbarSeverity("error");
        return;
      }

      // Refresh the conversation list
      const updatedList = conversations.filter(
        (conv) => conv.conversation_id !== itemToBeDeleted
      );
      setConversations(updatedList);

      setItemToBeDeleted(null);

      // Redirect to another conversation or fallback
      if (updatedList.length > 0) {
        router.push(`/sessions/${updatedList[0].conversation_id}`);
      } else {
        setItemToBeDeleted(null); // Clear `itemToBeDeleted`
        router.push("/");
      }
      setOpen(true);
      setSnackbarMessage("Conversation successfully deleted!");
      setSnackbarSeverity("success");
    } catch (error: any) {
      console.error("Unexpected error during deletion:", error.message);
      setSnackbarMessage("Unexpected error occurred. Please try again.");
      setSnackbarSeverity("error");
    }
  };

  const handleDialogClose = (confirm: boolean) => {
    setIsDialogOpen(false);
    handleMenuClose();
    if (confirm && itemToBeDeleted) {
      handleDelete();
    }
  };

  const handleDialogOpen = () => {
    setAnchorEl(null);
    setIsDialogOpen(true);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="flex flex-col p-4 items-center justify-center w-full">
        <h1 className="text-pretty" style={styles.conversationListText}>
          No sessions found. Start a new debugging session to create one!
        </h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-4 max-h-[600px] overflow-y-auto scroll-smooth gap-4">
      <Button
        onClick={() => {
          router.push("/");
          closeSSE();
        }}
        variant="secondary"
      >
        Back to home
      </Button>
      <ul style={{ listStyle: "none", padding: 0, color: "#ccc" }}>
        {conversations.map((conversation) => (
          <li
            key={conversation.conversation_id}
            className="hover:bg-[rgba(0,0,0,0.05)] cursor-pointer transition-all duration-200"
            style={
              selectedConversationId === conversation.conversation_id
                ? styles.selectedConversationListContainer
                : styles.conversationListContainer
            }
            onClick={() => {
              router.push(`/sessions/${conversation.conversation_id}`);
            }}
          >
            <div className="flex flex-row justify-between w-full items-center text-ellipsis px-2">
              <h2 style={styles.conversationListText}>
                {conversation.title || "Untitled Conversation"}
              </h2>
              <IconButton
                onClick={(event) => {
                  event.stopPropagation();
                  handleMenuOpen(event, conversation.conversation_id!);
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                style={{ marginLeft: 4 }}
              >
                <MenuItem
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent bubbling to the list item
                    handleDialogOpen();
                  }}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  Delete
                </MenuItem>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
      <Dialog
        open={isDialogOpen}
        fullWidth
        onClose={() => handleDialogClose(false)}
      >
        <DialogTitle className="border-b border-[1px solid #ccc]">
          Delete session?
        </DialogTitle>
        <DialogContent className="mt-4 text-gray-600">
          This is not reversable.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose(false)} variant="secondary">
            Cancel
          </Button>
          <Button onClick={() => handleDialogClose(true)} variant="destructive">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <div>
        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert
            onClose={handleClose}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ConversationsList;
