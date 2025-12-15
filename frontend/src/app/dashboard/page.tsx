"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { DashboardLayout } from "@/components/dashboard-layout";
import { User } from "@/types";


const statCards = [
  { title: "Mailbox received", value: "12" },
  { title: "Bookings this month", value: "8" },
  { title: "Expenditure this month", value: "€4.2k" },
  { title: "Virtual Office status", value: "Active" },
];

export default function DashboardContent() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false); // Prevent flash of unauthenticated content
  const [user, setUser] = useState<User | null>(null); // User data from localStorage

  useEffect(() => {
    // Check authentication and redirect to login if no JWT token
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
        /* ignore parse errors */
      }
    }
    setLoaded(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!loaded) return null;

  return (
    <DashboardLayout
      active="dashboard"
      userName={user?.name}
      userEmail={user?.email}
      onLogout={handleLogout}
      searchPlaceholder="Search tenants, rooms, automations"
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

        {/* Stat cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(auto-fit, minmax(220px, 1fr))", lg: "repeat(4, 1fr)" },
            gap: 2,
          }}
        >
          {statCards.map((card) => (
            <Paper key={card.title} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {card.title.toUpperCase()}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Today
              </Typography>
            </Paper>
          ))}
        </Box>

        {/* Upcoming bookings placeholder */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Upcoming bookings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your next scheduled reservations will appear here.
              </Typography>
            </Box>
            <Button variant="contained" color="success" sx={{ textTransform: "none" }} onClick={() => router.push("/bookings")}>
              Manage bookings
            </Button>
          </Stack>
          <Box sx={{ mt: 3, height: 120, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #e5e7eb" }} />
        </Paper>
      </Stack>
    </DashboardLayout>
  );
}
