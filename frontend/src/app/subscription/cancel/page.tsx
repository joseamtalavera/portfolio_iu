"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CancelIcon from "@mui/icons-material/Cancel";
import { DashboardLayout } from "@/components/dashboard-layout";
import { User } from "@/types";

export default function SubscriptionCancelPage() {
  const router = useRouter();
  const theme = useTheme();
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
            <CancelIcon sx={{ fontSize: 80, color: theme.palette.brand.muted, mx: "auto" }} />
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
                  color: theme.palette.brand.muted,
                  borderColor: theme.palette.brand.muted,
                  "&:hover": {
                    borderColor: theme.palette.brand.muted,
                    bgcolor: theme.palette.brand.lightBg,
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
                  bgcolor: theme.palette.brand.green,
                  "&:hover": {
                    bgcolor: theme.palette.brand.greenHover,
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
