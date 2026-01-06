"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Paper, Stack, Typography, CircularProgress, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DashboardLayout } from "@/components/dashboard-layout";
import { User } from "@/types";
import { API_URL } from "@/config/constants";

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        if (!token) {
            router.replace("/login");
            return;
        }

        // Refresh user data to get the updated subscription status
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${API_URL}/user/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const userData = await response.json() as User;
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                } else {
                    setError("Failed to fetch user data");
                }
            } catch (err) {
                setError("An error occurred while verifying your subscription");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        router.push("/login");
    };

    const handleGoToDashboard = () => {
        router.push("/dashboard");
    };

    if (loading) {
        return (
            <Box 
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh"
                }}>
                    <CircularProgress />
            </Box>
        );
    }

    return (
        <DashboardLayout
            active="dashboard"
            user={user}
            onLogout={handleLogout}
        >
            <Box 
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh"
                }}
            >
                <Paper sx={{ p: 4, maxWidth: 500, borderRadius: 3, textAlign: "center"}}>
                    <Stack spacing={3}>
                        {error ? (
                            <Alert severity="error"></Alert>
                        ) : (
                        <>
                            <CheckCircleIcon sx={{ fontSize: 80, color: theme.palette.brand.green, mx: "auto" }} />
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1}}>
                                    Subscription Activated!
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Thank you for subscribing. Your account is now active and you have full access to all the features.
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleGoToDashboard}
                                sx={{
                                    textTransform: "none",
                                    bgcolor: theme.palette.brand.green,
                                    "&:hover": {
                                        bgcolor: theme.palette.brand.greenHover,
                                    },
                                }}
                            >
                                Go to Dashboard
                            </Button>
                        </>
                        )}
                    </Stack>
                </Paper>
            </Box>
        </DashboardLayout>
    );
}
