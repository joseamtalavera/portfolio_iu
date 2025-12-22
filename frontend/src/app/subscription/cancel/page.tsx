"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { DashboardLayout } from "@/components/dashboard-layout";
import { User } from "@/types";

export default function SubscriptionCancelPage() {
  const router = useRouter();
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

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleTryAgain = () => {
    router.push("/dashboard");
  };

  return (
    <DashboardLayout
      active="dashboard"
      user={user}
      onLogout={handleLogout}
    >
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Paper sx={{ p: 4, maxWidth: 500, borderRadius: 3, textAlign: "center" }}>
          <Stack spacing={3}>
            <CancelIcon sx={{ fontSize: 80, color: "#6b7280", mx: "auto" }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Subscription Cancelled
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your subscription was not completed. You can try again anytime from your dashboard.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={handleGoToDashboard}
                sx={{
                  textTransform: "none",
                  color: "#6b7280",
                  borderColor: "#6b7280",
                  "&:hover": {
                    borderColor: "#6b7280",
                    bgcolor: "#f9fafb",
                  },
                }}
              >
                Go To Dashboard
              </Button>
              <Button
                variant="contained"
                onClick={handleTryAgain}
                sx={{
                  textTransform: "none",
                  bgcolor: "#2ecc71",
                  "&:hover": {
                    bgcolor: "#27ae60",
                  },
                }}
              >
                Try Again
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </DashboardLayout>
  );
}