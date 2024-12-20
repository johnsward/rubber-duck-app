"use client";
import { LoadingProvider, useLoading } from "@/app/context/LoadingContext";
import React, { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { styles } from "./styles/styles";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LinearProgress from "@mui/material/LinearProgress";
import { CircularProgress, Snackbar, SnackbarCloseReason } from "@mui/material";
import Alert from "@mui/material/Alert";
import AuthenticatedConversation from "./components/conversation/AuthenticatedConversation";
import UnauthenticatedConversation from "./components/conversation/UnauthenticatedConversation";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isLoading, setLoading } = useLoading();
  const [open, setOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams(); // For detecting the current conversation
  const conversationId = searchParams.get("id"); // Extract 'id' from the URL

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsLoggedIn(!!data.session);
      } catch (error: any) {
        setErrorMessage("Failed to authenticate.");
        setOpen(true);
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isUserLoggedIn = !!session;
      setIsLoggedIn(isUserLoggedIn); 

      if (isUserLoggedIn) {
        localStorage.removeItem("conversationEntries");
      }
    });
    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);



  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  if (isLoading) {
    return (
      <div style={styles.pageContainer}>
        <CircularProgress/>
      </div>
    );
  }

  const handleLoginRedirect = () => {
    router.push("/auth");
  };

  const handleRegisterRedirect = () => {
    router.push("/auth/register");
  };
  

  return (
    <div className="flex flex-col h-screen">
      <Header isSidebarCollapsed={isCollapsed} isLoggedIn={isLoggedIn} />

      <div className="flex flex-row flex-grow">
        <Sidebar
          isCollapsed={isCollapsed}
          onLogin={handleLoginRedirect}
          onRegister={handleRegisterRedirect}
          isLoggedIn={isLoggedIn}
          toggleSidebar={toggleSidebar}
          selectedConversationId={conversationId}
        />

        <div className="w-full h-full">
          {isLoggedIn ? (
            <AuthenticatedConversation />
          ) : (
            <UnauthenticatedConversation />
          )}
        </div>
        {errorMessage && (
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alert
              onClose={handleClose}
              severity="error"
              variant="filled"
              sx={{ width: "100%" }}
            >
              {errorMessage}
            </Alert>
          </Snackbar>
        )}
      </div>
    </div>
  );
}
