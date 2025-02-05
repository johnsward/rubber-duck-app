"use client";
import { useLoading } from "@/app/context/LoadingContext";
import React, { useEffect, useState, Suspense } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { styles } from "./styles/styles";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CircularProgress, Snackbar, SnackbarCloseReason } from "@mui/material";
import Alert from "@mui/material/Alert";
import AuthenticatedConversation from "./components/conversation/AuthenticatedConversation";
import UnauthenticatedConversation from "./components/conversation/UnauthenticatedConversation";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isLoading, setLoading } = useLoading();
  const [open, setOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const router = useRouter();

  const SearchParamsWrapper = ({ setConversationId }: { setConversationId: (id: string | null) => void }) => {
    const searchParams = useSearchParams();
    const conversationId = searchParams.get("id");
  
    setConversationId(conversationId); // Update parent state
  
    return null; // This component does not render anything
  };

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.auth.getSession();
        setIsLoggedIn(!!data.session);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setErrorMessage("Failed to authenticate.");
          setOpen(true);
          console.error(error.message);
        }
      } finally {
        setLoading(false); // Ensure loading is stopped in all cases
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
        <CircularProgress />
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
        <Suspense fallback={<CircularProgress />}>
          <SearchParamsWrapper setConversationId={setConversationId} /> {/* ✅ Get params safely */}
        </Suspense>
          <Sidebar
            isCollapsed={isCollapsed}
            onLogin={handleLoginRedirect}
            onRegister={handleRegisterRedirect}
            isLoggedIn={isLoggedIn}
            toggleSidebar={toggleSidebar}
            selectedConversationId={conversationId} // ✅ Wrapped inside Suspense
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
