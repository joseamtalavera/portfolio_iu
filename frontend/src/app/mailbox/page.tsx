"use client";

/**
 * Mailbox page showing messages and PDF attachments.
 */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DashboardLayout } from "@/components/dashboard-layout";
import { User, MailItem } from "@/types";
import { API_URL } from "@/config/constants";

/**
 * Renders the mailbox view for the authenticated user.
 *
 * @returns page component
 */
export default function MailboxPage() {
  const theme = useTheme();
  const router = useRouter();
  const [ready, setReady] = useState(false); // prevents rendering of unauthenticated content
  const [user, setUser] = useState<User | null>(null); // authenticated user data
  const [mail, setMail] = useState<MailItem[]>([]); // mailbox items for API
  const [loading, setLoading] = useState(true); // show loading spinner while fetching data
  const [error, setError] = useState<string | null>(null); // error message from API
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

  if (!ready) {
    return (
      <DashboardLayout
        active="mailbox"
        user={user}
        onLogout={handleLogout}
        paywallReady={ready}
      >
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      active="mailbox"
      user={user}
      onLogout={handleLogout}
      paywallReady={ready}
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
                          slotProps={{ secondary: { component: "div" } }} // render secondary as <div> so the two <Typography> (<p>) inside are valid HTML
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
                            borderColor: theme.palette.brand.green,
                            color: theme.palette.brand.green,
                            "&:hover": {
                              borderColor: theme.palette.brand.greenHover,
                              color: theme.palette.brand.greenHover,
                              bgcolor: theme.palette.brand.accentSoft,
                            },
                          }}
                          onClick={() => {
                            if (!item.pdfUrl) {
                              setAttachmentError("No attachment available for this message.");
                              return;
                            }
                            setAttachmentError(null);
                            // Open the PDF in a new tab. The backend serves /pdfs with
                            // X-Frame-Options: SAMEORIGIN, so it can't be embedded in an
                            // iframe from the frontend origin — a new tab avoids framing.
                            window.open(item.pdfUrl, "_blank", "noopener,noreferrer");
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
    </DashboardLayout>
  );
}
