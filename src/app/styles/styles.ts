// styles.ts
export const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    maxHeight: "100vh",
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

  introductionContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%"
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
    maxWidth: 400
  } as React.CSSProperties,

  rubberDuckContainer: {
    position: "absolute" as "absolute",
    top: 0,
    left: 0,
  } as React.CSSProperties,

  conversationContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "calc(100vh - 120px)",
    padding: "16px",
  } as React.CSSProperties,

  messagesContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    gap: 8,
    maxHeight: "100%",
    overflowY: "auto",
  } as React.CSSProperties,

  userMessageStyle: {
    alignSelf: "flex-end",
    maxWidth: 600,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#e0f7fa",
  } as React.CSSProperties,

  responseMessageStyle: {
    alignSelf: "flex-start",
    maxWidth: 600,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  } as React.CSSProperties,

  messagesContainerStyle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    width: 800,
    gap: 8,
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
};
