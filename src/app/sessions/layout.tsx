"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { useParams } from "next/navigation";

const ConversationLayout = ({ children }: { children: React.ReactNode }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { id } = useParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") {
      setSelectedConversationId(id);
    } else {
      setSelectedConversationId(null); // Fallback if ID is undefined or an array
    }
  }, [id]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex flex-col h-screen">
      
      <Header isSidebarCollapsed={isCollapsed} isLoggedIn={true} />

      <div className="flex flex-row flex-grow">

        <Sidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          isLoggedIn={true}
          onLogin={() => {}}
          onRegister={() => {}}
          selectedConversationId={selectedConversationId}
        />

        {/* Page Content */}
        <div className="flex flex-col h-[100vh] w-full">{children}</div>
      </div>
    </div>
  );
};

export default ConversationLayout;