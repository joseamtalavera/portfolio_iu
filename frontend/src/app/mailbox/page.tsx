"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  CircularProgress,
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
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mail, setMail] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
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
        const data = (await response.json()) as MailItem[];
        setMail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load mailbox");
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    loadMail();
  }, [router]);

  if (!ready) return null;

  return (
    <DashboardLayout
      active="mailbox"
      userName={user?.name}
      userEmail={user?.email}
      onLogout={handleLogout}
      searchPlaceholder="Search mailbox"
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Mailbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Latest messages from your mailbox.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {mail.length === 0 && !error ? (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  No messages yet.
                </Typography>
              </Paper>
            ) : (
              <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                <List disablePadding>
                  {mail.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem alignItems="flex-start" sx={{ py: 1.5, px: 2 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {item.subject}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {item.message}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.timestamp).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
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
    </DashboardLayout>
  );
}
