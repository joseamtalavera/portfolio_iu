"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Typography, CircularProgress, Alert, Chip } from "@mui/material";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MailItem, Booking, User } from "@/types";
import { API_URL } from "@/config/constants";

export default function DashboardContent() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser) as User;
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mailbox, setMailbox] = useState<MailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication and redirect to login if no JWT token
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoaded(true);

    // Fetch bookings and mailbox items
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bookingResponse, mailboxResponse] = await Promise.all([ 
          fetch(`${API_URL}/bookings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/mailbox`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!bookingResponse.ok) {
          throw new Error("Failed to fetch bookings");
        }
        if (!mailboxResponse.ok) {
          throw new Error("Failed to fetch mailbox items");
        }

        const bookingsData = await bookingResponse.json() as Booking[];
        const mailboxData = await mailboxResponse.json() as MailItem[];

        setBookings(bookingsData);
        setMailbox(mailboxData);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Deliveries parcel or mail today
    const deliveriesToday = mailbox.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= today;
    }).length;

    // Deliveries parcel or mail this month
    const deliveriesThisMonth = mailbox.filter((item) => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startOfMonth;
    }).length;

    // Bookings this month
    const bookingsThisMonth = bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate >= startOfMonth;
    }).length;

    // Bookings remaining this month
    const bookingsRemaining = Math.max(0, 5 - bookingsThisMonth);

    // Status of virtual office // assume active till stripe payment is set up
    const status = user?.subscriptionStatus?.toLocaleLowerCase() || "inactive";
    return {
      deliveriesToday,
      deliveriesThisMonth,
      bookingsThisMonth,
      bookingsRemaining,
      status,
    };
  }, [bookings, mailbox, user?.subscriptionStatus]);

  // Get the upcoming bookings
  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((booking) => {
        const bookingDateTime = new Date(`${booking.date}T${booking.startHour}`);
        return bookingDateTime >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startHour}`);
        const dateB = new Date(`${b.date}T${b.startHour}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5); // show the next 5 bookings
  }, [bookings]);
 

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!loaded) return null;

  const statCards = [
    { title: "Deliveries Today", value: stats.deliveriesToday.toString(), isStatus: false },
    { title: "Deliveries This Month", value: stats.deliveriesThisMonth.toString(), isStatus: false },
    { title: "Bookings This Month", value: stats.bookingsThisMonth.toString(), isStatus: false },
    { title: "Bookings Remaining", value: stats.bookingsRemaining.toString(), isStatus: false },
    { title: "Status", value: stats.status.charAt(0).toUpperCase() + stats.status.slice(1), isStatus: true },
  ];

  return (
    <DashboardLayout
      active="dashboard"
      user={user}
      onLogout={handleLogout}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Good evening{user?.name ? `, ${user.name}` : ""}. Here&apos;s the latest across your spaces.
          </Typography>
        </Box>

        {error && (<Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>)}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stat cards */}
            <Box 
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(auto-fit, minmax(200px, 1fr))",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                  xl: "repeat(5, 1fr)",
                },
                gap: 2,
              }}
            >
              {statCards.map((card) => (
                <Paper key={card.title} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb:1}}>
                    {card.title.toUpperCase()}
                  </Typography>
                  {card.isStatus ? (
                    <Chip 
                      label={card.value}
                      color={stats.status === "active" ? "success" : "default"}
                      sx={{
                        mt: 1,
                        fontWeight:600,
                        bgcolor: stats.status === "active" ? "#2ecc71" : "#6b7280",
                        color: "#fff",
                      }}
                    />
                  ) : (
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                      {card.value}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>


        {/* Upcoming bookings placeholder */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upcoming bookings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {upcomingBookings.length > 0 
                  ? `Your next ${upcomingBookings.length} scheduled reservation${upcomingBookings.length > 1 ? "s": ""}`
                : "No upcoming bookings. Create a new booking to get started."}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              sx={{ 
                textTransform: "none",
                bgcolor: "#2ecc71",
                "&:hover": {
                  bgcolor: "#27ae60",
                },
              }} 
              onClick={() => router.push("/bookings")}
              >
              Manage Bookings
            </Button>
          </Stack>
          {upcomingBookings.length === 0 ? (
            <Box 
              sx={{ 
                mt: 3, 
                height: 120, 
                bgcolor: "#f8fafc", 
                borderRadius: 2, 
                border: "1px dashed #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No upcoming bookings. Create a new booking to get started.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {upcomingBookings.map((booking) => {
                const bookingDate = new Date(booking.date);
                const formattedDate = bookingDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const formattedTime = `${booking.startHour} - ${booking.endHour}`;

                return (
                  <Paper
                    key={booking.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      "&:hover": {
                        bgcolor: "#f9fafb",
                      },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {booking.product}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formattedDate} • {formattedTime}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {booking.attendees} attendee{booking.attendees !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
            </Paper>
          </>
        )}
        </Stack>
    </DashboardLayout>
  );
}
