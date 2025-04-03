import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  Link,
  IconButton,
  Tooltip,
  Popper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactMarkdown from "react-markdown";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ChatManager from "./chat_manager";
import ChatMessage from "./chat_message";
import ThoughtBubble from "./thought_bubble";
import Image from "next/image";
import LinkIcon from "@mui/icons-material/Link";
import CircleIcon from "@mui/icons-material/Circle";
import { v4 as uuidv4 } from "uuid";
import { Note } from "../../types/note";
import { useRouter } from "next/router";

import styles from "../../styles/chat_window.module.scss";
import { AppDispatch, RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { createNote } from "../note/redux/notesSlice";
import {
  selectActiveSession,
  selectMessages,
  selectLoading,
  sendChatMessage,
  cleanActiveSession,
} from "./redux/chatSlice";

const ChatWindow = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [inputText, setInputText] = useState("");
  // Use Redux state instead of local state
  const activeSession = useSelector(selectActiveSession);
  const messages = useSelector(selectMessages);
  const loading = useSelector(selectLoading);

  // Add a new state variable to track note creation status
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const colors = ["#80cbc4", "#b2dfdb"]; // set up colors
  const [boxMaxWidth, setBoxMaxWidth] = useState("70%");
  const [boxPadding, setBoxPadding] = useState("8px 12px");
  const [boxMargin, setBoxMargin] = useState("0 5%");

  // For text selection
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showSelectionButton, setShowSelectionButton] = useState(false);

  // Create a virtual element for the Popper
  const virtualElement = useMemo(() => {
    if (!selectionPosition) return null;

    return {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        top: selectionPosition.top,
        right: selectionPosition.left,
        bottom: selectionPosition.top,
        left: selectionPosition.left,
        x: selectionPosition.left,
        y: selectionPosition.top,
        toJSON: () => {},
      }),
    };
  }, [selectionPosition]);

  const messageListRef = useRef<HTMLUListElement>(null);
  const inputAreaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Update viewport height for mobile browsers
    function updateViewportHeight() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    function handleOrientationChange() {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      if (isLandscape) {
        setBoxMaxWidth("70%");
        setBoxMargin("5% 5%");
        setBoxPadding("8px 12px");
      } else {
        setBoxMaxWidth("95%");
        setBoxMargin("1% 1%");
        setBoxPadding("4px 7px");
      }
      // Update viewport height after orientation change
      updateViewportHeight();
    }

    // Scroll to bottom whenever messages change, including streaming updates
    messageListRef.current &&
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    inputAreaRef.current?.focus();

    // Add event listener for text selection
    const handleTextSelection = () => {
      const selection = window.getSelection();

      if (
        selection &&
        selection.toString().trim() !== "" &&
        selection.rangeCount > 0
      ) {
        // Only handle selections within bot messages (which have a class we can check)
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;

        // Check if selection is within a bot message
        let isInBotMessage = false;
        let element: Node | null = container;
        while (element && element !== document.body) {
          if (
            element.nodeType === Node.ELEMENT_NODE &&
            (element as Element).classList?.contains(styles["message-content"])
          ) {
            isInBotMessage = true;
            break;
          }
          element = element.parentNode;
        }

        if (isInBotMessage) {
          const selectedText = selection.toString();
          const rect = range.getBoundingClientRect();

          setSelectedText(selectedText);
          setSelectionPosition({
            top: rect.bottom + window.scrollY,
            left: rect.right + window.scrollX,
          });
          setShowSelectionButton(true);
        } else {
          setShowSelectionButton(false);
        }
      } else {
        setShowSelectionButton(false);
      }
    };

    document.addEventListener("selectionchange", handleTextSelection);
    // Initial viewport height calculation
    updateViewportHeight();

    // Add event listeners for viewport height updates
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      document.removeEventListener("selectionchange", handleTextSelection);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, [messages]);

  const handleSendMessage = async () => {
    console.log(
      `Current session name ${activeSession.name}, id: ${activeSession.id}`
    );
    const inputValue = inputText;
    setInputText("");
    // Dispatch the sendChatMessage action instead of directly calling the ChatManager
    dispatch(sendChatMessage({ message: inputValue, stream: true }));
    // Focus the input field after sending
    setTimeout(() => {
      inputAreaRef.current?.focus();
    }, 100);
  };

  const handleCleanActiveSession = () => {
    dispatch(cleanActiveSession());
  };

  const handleCreateNote = () => {
    console.log("handleCreateNote function called");

    if (!selectedText) {
      console.log("No text selected, returning early");
      return;
    }

    try {
      // Set the creating note state to true to show progress indicator
      setIsCreatingNote(true);
      console.log(
        "Processing selected text: ",
        selectedText.substring(0, 20) + "..."
      );

      // Format the current date and time for the title
      const now = new Date();
      const formattedDate = now
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");

      // Create a new note with the selected text
      const newNote: Note = {
        localId: uuidv4(),
        title: `ai-assistant-${formattedDate}`,
        content: `<p>${selectedText}</p>`,
        date: now.toISOString(),
        isDraft: true,
      };

      console.log("Created new note with ID:", newNote.localId);

      // Clear the text selection
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
        console.log("Selection cleared");
      }

      // Hide the selection button
      setShowSelectionButton(false);
      console.log("Selection button hidden");

      // Directly create the note using Redux
      dispatch(createNote(newNote))
        .unwrap()
        .then((createdNote) => {
          console.log(
            "Note created in Redux store with ID:",
            createdNote.localId
          );
          // Signal to switch tabs with just the noteId
          const switchTabsEvent = new CustomEvent("switchToNotesTab", {
            detail: { noteId: createdNote.localId },
          });
          window.dispatchEvent(switchTabsEvent);
          console.log("Dispatched tab switch event with note ID");
        })
        .catch((error) => {
          console.error("Error creating note:", error);
        })
        .finally(() => {
          // Reset creating state when operation completes (success or error)
          setIsCreatingNote(false);
        });
    } catch (error) {
      console.error("Error in handleCreateNote:", error);
      // Also reset creating state if there's an error
      setIsCreatingNote(false);
    }
  };

  return (
    <Box
      sx={{
        "&": {
          display: "flex",
          flexDirection: "column",
          margin: boxMargin, // sets margin for the root element of ListItem
          paddingBottom: "2px",
          height: "calc(calc(var(--vh, 1vh) * 100) - 80px)",
          overflow: "hidden",
        },
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        {activeSession.name || "Session 0"}
      </Typography>
      <Divider />
      <Box
        mt={2}
        p={0}
        style={{ flexGrow: "1", overflow: "hidden", position: "relative" }}
      >
        <List
          ref={messageListRef}
          style={{
            height: "100%",
            background: "#eceff1",
            overflowY: "scroll",
          }}
        >
          {messages.map((message, index) => (
            <ListItem
              key={index}
              style={{
                flexDirection: message.type === 0 ? "row" : "row-reverse",
                alignItems: "start",
              }}
            >
              {message.type === 0 ? (
                <div>
                  <Image
                    src="/bot_avatar.jpg"
                    alt="Landscape picture"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      marginRight: "2px",
                      overflow: "hidden",
                    }}
                    width={40}
                    height={40}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box
                component="div"
                style={{
                  maxWidth: boxMaxWidth,
                  borderRadius: "9px",
                  margin: "1px",
                  padding: boxPadding,
                  backgroundColor: colors[index % 2],
                  position: "relative", // Added for positioning CircularProgress
                }}
              >
                <p
                  style={{
                    margin: "0",
                    color: message.type === 0 ? "#666" : "#fff",
                    fontSize: "0.6em",
                    lineHeight: "1",
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>

                {/* Always show thought bubble and message content */}
                {message.thought && message.type === 0 && (
                  <ThoughtBubble
                    thought={message.thought}
                    defaultExpanded={message.isWaiting}
                  />
                )}
                <ReactMarkdown className={styles["message-content"]}>
                  {message.content}
                </ReactMarkdown>

                {/* Display references if they exist */}
                {message.references && message.references.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      pt: 1,
                      borderTop: "1px solid rgba(0,0,0,0.1)",
                      fontSize: "0.9em",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <LinkIcon fontSize="small" sx={{ mr: 0.5 }} /> References:
                    </Typography>
                    <List dense sx={{ py: 0, mt: 0.5 }}>
                      {message.references.map((ref, idx) => (
                        <ListItem
                          key={idx}
                          sx={{
                            py: 0.25,
                            px: 0,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <CircleIcon
                            sx={{ fontSize: 8, mr: 1, color: "text.secondary" }}
                          />
                          {ref.url ? (
                            <Link
                              href={ref.url}
                              underline="hover"
                              color="primary"
                              sx={{ fontSize: "0.95em" }}
                            >
                              {(ref.id ?? "") + " " + (ref.name ?? "")}
                            </Link>
                          ) : (
                            <Typography variant="body2">
                              {(ref.id ?? "") + " " + (ref.name ?? "")}
                            </Typography>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Show CircularProgress overlay when waiting */}
                {message.isWaiting && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.7)", // semi-transparent backdrop
                      borderRadius: "9px",
                      zIndex: 1,
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                )}
              </Box>
            </ListItem>
          ))}
        </List>

        {/* Floating button for creating a note from selected text */}
        { (isCreatingNote || (showSelectionButton && virtualElement)) && (
          <Popper
            open={true}
            anchorEl={virtualElement}
            placement="bottom-start"
            style={{ zIndex: 9999 }} // Ensure very high z-index
            modifiers={[
              {
                name: "offset",
                options: {
                  offset: [0, 2],
                },
              },
            ]}
          >
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={isCreatingNote ? null : <NoteAddIcon />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Save as note button clicked");
                handleCreateNote();
              }}
              disabled={isCreatingNote}
              data-selection-button="true"
              sx={{
                p: 1,
                minWidth: "auto",
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              {isCreatingNote ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : (
                "Save as note"
              )}
            </Button>
          </Popper>
        )}
      </Box>
      <Box
        mt={2}
        display="flex"
        alignItems="center"
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "#fff",
          zIndex: 1000,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <TextField
          inputRef={inputAreaRef}
          disabled={loading}
          fullWidth
          placeholder="Type your message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          variant="outlined"
          multiline
          rows={2}
          style={{ marginRight: "10px" }}
        />
        <Box display="flex" flexDirection="column" gap="5px">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputText || loading}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleCleanActiveSession}
            disabled={loading}
            endIcon={<DeleteForeverIcon />}
          >
            Clean
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatWindow;
