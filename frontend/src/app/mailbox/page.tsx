"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { DashboardLayout } from "@/components/dashboard-layout";
import { User, MailItem } from "@/types";
import { API_URL } from "@/config/constants";

export default function MailboxPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false); // prevents rendering of unauthenticated content
  const [user, setUser] = useState<User | null>(null); // authenticated user data
  const [mail, setMail] = useState<MailItem[]>([]); // mailbox items for API
  const [loading, setLoading] = useState(true); // show loading spinner while fetching data
  const [error, setError] = useState<string | null>(null); // error message from API
  const [pdfUrl, setPdfUrl] = useState<string | undefined>(undefined); // control dialog for PDF attachment
  const [pdfOpen, setPdfOpen] = useState(false); // control dialog visibility
  const [attachmentError, setAttachmentError] = useState<string | null>(null); // error is displayed if no attachment is available

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser)); // parse the JSON string and set the user state
      } catch {
        localStorage.removeItem("user"); // if parsing fails (corrup data), remove the user from localStorage
      }
    }

    const loadMail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/mailbox`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch mailbox items");
        }
        const data = (await response.json()) as MailItem[]; // MailItem[] is an array of MailItem objects
        setMail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load mailbox");
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    loadMail(); // loadMail is invoked and the mailbox items are loaded from the API
  }, [router]); // loadMail is invoked when the component mounts or when the router changes

  if (!ready) return null;

  return (
    <DashboardLayout
      active="mailbox"
      user={user}
      onLogout={handleLogout}
    >
      <Stack spacing={3}> {/* Spacing between the components */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}> {/* Heading for the mailbox */}
            Mailbox
          </Typography>
          <Typography variant="body2" color="text.secondary"> {/* Subheading for the mailbox */}
            Latest messages from your mailbox.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>} {/* Error message from API */}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}> {/* Loading spinner */}
            <CircularProgress />
          </Box>
        ) : (
          <> {/* If the data is loaded, the mailbox items are displayed */}
            {mail.length === 0 && !error ? (
              <Paper sx={{ p: 3, borderRadius: 3 }}> {/* Paper is a container for the mailbox items */}
                <Typography variant="body2" color="text.secondary"> {/* No messages yet */}
                  No messages yet.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 3, overflow: "hidden" }}> {/* Paper is a container for the mailbox items */}
                <List disablePadding> {/* List is a container for the mailbox items */}
                  {mail.map((item) => (
                    <React.Fragment key={item.id}> {/* React.Fragment is a container for the mailbox items */}
                      <ListItem alignItems="flex-start" sx={{ py: 1.5, px: 2, gap: 2 }}>
                        <ListItemText // ListItemText is a container for the mailbox items 
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}> {/* Subject of the mailbox item */}
                              {item.subject}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}> {/* Message of the mailbox item */}
                                {item.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary"> {/* Timestamp of the mailbox item */}
                                {new Date(item.timestamp).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{
                            textTransform: "none",
                            borderColor: "#2ecc71",
                            color: "#2ecc71",
                            "&:hover": {
                              borderColor: "#27ae60",
                              color: "#27ae60",
                              bgcolor: "#e8f6ef",
                            },
                          }}
                          onClick={() => {
                            if (!item.pdfUrl) {
                              setAttachmentError("No attachment available for this message.");
                              return;
                            }
                            setAttachmentError(null);
                            setPdfUrl(item.pdfUrl);
                            setPdfOpen(true);
                          }}
                        >
                          Open
                        </Button>
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            )}
          </>
        )}
      </Stack>

      {attachmentError && <Alert severity="warning">{attachmentError}</Alert>} {/* Attachment error message */}

      {pdfOpen && pdfUrl && (
        <Dialog open onClose={() => setPdfOpen(false)} fullWidth maxWidth="md"> {/* Dialog is a container for the mailbox attachment */}
          <DialogTitle>Mailbox attachment</DialogTitle> {/* Title of the mailbox attachment */}
          <DialogContent dividers sx={{ height: "70vh", p: 0 }}>
            <iframe // when the src points to a PDF the browser's build-in PDF viewer is used
              title="Mail PDF" // Title of the mailbox attachment 
              src={pdfUrl}
              style={{ border: "none", width: "100%", height: "100%" }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setPdfOpen(false)}
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>
            <Button 
              href={pdfUrl} 
              target="_blank" 
              rel="noreferrer" 
              variant="outlined"
              sx={{
                textTransform: "none",
                borderColor: "#2ecc71",
                color: "#2ecc71",
                "&:hover": {
                  borderColor: "#27ae60",
                  color: "#27ae60",
                  bgcolor: "#e8f6ef",
                },
              }}
            >
              Open In New Tab
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
