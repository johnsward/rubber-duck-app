import React from "react";

// styles.ts
export const styles = {
  pageContainer: {
    position: "relative",
    margin: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    overflow: "hidden",
  } as React.CSSProperties,

  startPage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
  } as React.CSSProperties,

  darkText: {
    fontSize: 16,
    fontWeight: 400,
    color: "#242424",
  } as React.CSSProperties,

  lightText: {
    fontSize: 14,
    fontWeight: 600,
    color: "#A49CA1",
  } as React.CSSProperties,

  conversationListText: {
    textOverflow: "ellipsis",
    fontSize: 14,
    fontWeight: 400,
    color: "#242424",
  } as React.CSSProperties,

  registerLink: {
    fontSize: 14,
    fontWeight: 600,
    color: "#242424",
    textDecoration: "underline",
  } as React.CSSProperties,

  introductionContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  } as React.CSSProperties,

  greeting: {
    fontSize: 36,
    lineHeight: "20px",
    fontWeight: 600,
    color: "#A49CA1",
  } as React.CSSProperties,

  introductionQuestion: {
    fontSize: 36,
    lineHeight: "20px",
    fontWeight: 600,
    color: "#242424",
  } as React.CSSProperties,

  introductionDescription: {
    color: "#A49CA1",
    fontSize: 12,
    lineHeight: "16px",
    textWrap: "pretty",
    maxWidth: 400,
  } as React.CSSProperties,

  rubberDuckContainer: {
    position: "absolute",
    top: 0,
    left: 0,
  } as React.CSSProperties,

  conversationContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100vh",
    padding: "16px",
  } as React.CSSProperties,

  conversationListContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    width: "100%",
    borderRadius: 8,
    transition: "all 0.2s ease in out",
  } as React.CSSProperties,

  selectedConversationListContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    width: "100%",
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    transition: "all 0.2s ease in out",
  } as React.CSSProperties,

  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    margin: "40px 0 30px 0",
    width: "100%",
    gap: 8,
    maxHeight: "100%",
    overflowY: "auto",
    scrollbarWidth: "none",
    "::WebkitScrollbar": {
      display: "none",
    },
  } as React.CSSProperties,

  userMessageStyle: {
    alignSelf: "flex-end",
    maxWidth: 600,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#e0f7fa",
    wordWrap: "break-word",
    overflowWrap: "break-word",
  } as React.CSSProperties,

  responseMessageStyle: {
    alignSelf: "flex-start",
    maxWidth: 800,
    padding: 12,
    borderRadius: 10,
  } as React.CSSProperties,

  messagesContainerStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    width: 800,
    gap: 8,
    marginTop: 40,
    marginBottom: 80,
    overflowY: "auto",
  } as React.CSSProperties,

  textAreaContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    marginTop: "auto",
    padding: "8px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  } as React.CSSProperties,

  textAreaStyle: {
    width: "100%",
    resize: "none",
    outline: "none",
    boxShadow: "none",
    padding: 8,
    backgroundColor: "transparent",
    marginBottom: 8,
  } as React.CSSProperties,

  extendedSidebarContainer: {
    transition: "width 0.4s ease",
    height: "100%",
    width: 400,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  } as React.CSSProperties,

  collapsedSidebarContainer: {
    transition: "width 0.3s ease",
    width: 0,
    height: "100%",
  } as React.CSSProperties,

  collapsedHeaderContainer: {
    marginLeft: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "calc(100% - 5px)",
  } as React.CSSProperties,

  extendedHeaderContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    height: 64,
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "calc(100% - 260px)",
    marginLeft: 260,
  } as React.CSSProperties,

  sidebarHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    height: 70,
    padding: 12,
  } as React.CSSProperties,

  navigationMenuTriggerStyle: {
    display: "block",
    padding: "12px 8px",
    fontSize: 12,
    color: "#A49CA1",
    borderRadius: 4,
  },
};
