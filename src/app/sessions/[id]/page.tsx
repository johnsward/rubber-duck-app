"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AuthenticatedConversation from "@/app/components/conversation/AuthenticatedConversation";
import { CircularProgress } from "@mui/material";

const ConversationPage: React.FC = () => {
  const { id } = useParams();
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      setConversationId(id);
    }
  }, [id]);

  if (!conversationId) {
    return (
      <div className="flex w-full h-screen items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return <AuthenticatedConversation conversationId={conversationId} />;
};

export default ConversationPage;