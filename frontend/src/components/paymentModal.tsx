"use client";

import React, { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Button, 
    Box,
    Stack,
    Typography,
    CircularProgress,
    Alert,
    Divider
} from "@mui/material";
import { API_URL } from "@/config/constants";

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Inizialise Stripe ( i still need to add the public key to the .env file)

export default function PaymentModal({ open, onClose, onSuccess}: PaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async () => {
        setError(null);
        setLoading(true);

        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }

            // STEP 1: Send request to backend to create checkout session
            const response = await fetch(`${API_URL}/subscription/create-checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to create checkout session"}));
                throw new Error (errorData.message || "Failed to create checkout session");
            }
            const data = await response.json();
            const checkoutUrl = data.url;

            if (!checkoutUrl) {
                throw new Error("Checkout URL not found");
            }

            // STEP 2: Open checkout in new tab
            window.location.href = checkoutUrl;

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3, 
                },
            }}
        >

        <DialogTitle
            sx={{ 
                bgcolor: "#2ecc71",
                color: "white",
                fontWeight: 600, 
                py: 2,
            }}
        >
            Subscription Required 
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: "#1a1a1a"}}>
                        Unlock Full Access
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                        Subscribe to access all the features of the platform.
                    </Typography>
                </Box>

                <Divider />

                <Box
                    sx={{
                        bgcolor: "#f8f9fa",
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <Stack spacing={1}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                            <Typography variant="body1" sx={{fontWeight: 500}}>
                                Monthly Subscription
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "#2ecc71" }}>
                                15 EUR + VAT
                            </Typography>
                        </Box>
                        <Typography>
                            Billed monthly • Cancel anytime 
                        </Typography>
                    </Stack>
                </Box>

                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1}}>
                        <strong>What is included:</strong>
                    </Typography>
                    <Stack spacing={0.5} component="ul"  sx={{ m: 0, pl: 2 }}>
                        <Typography component="li" variant="body2" color="text.secondary">
                            Full access to all dashboard features
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                            Professional business address
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                            Mailbox access 
                        </Typography>
                        <Typography component="li" variant="body2" color="text.secondary">
                            Unlimited bookings
                        </Typography>
                    </Stack>
                </Box>
           </Stack>
        </DialogContent>

        <DialogActions sx={{ px:3, pb: 3, gap: 1 }}>
            <Button
                onClick={onClose}
                disabled={loading}
                sx={{
                    textTransform: "none",
                    color: "#6b7280",
                }}
            >
                Cancel
            </Button>
            <Button
                onClick={handleSubscribe}
                disabled={loading}
                variant="contained"
                sx={{
                    textTransform: "none",
                    bgcolor: "#2ecc71",
                    "&:hover": {
                        bgcolor: "#27ae60",
                    },
                minWidth: 120,
                }}
            >
                {loading ? (
                    <CircularProgress size={20} sx={{ color: "white"}} />
                ) : (
                    "Subscribe"
                )}
            </Button>
        </DialogActions>
            

        </Dialog>
    );
}

