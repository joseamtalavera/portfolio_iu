"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { User } from "@/types";
import { API_URL } from "@/config/constants";

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
    onUpdate: (updatedUser: User) => void;
}

export default function ProfileModal({ open, onClose, user, onUpdate }: ProfileModalProps) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [billingAddress, setBillingAddress] = useState("");
    const [billingCity, setBillingCity] = useState("");
    const [billingCountry, setBillingCountry] = useState("");
    const [billingPostalCode, setBillingPostalCode] = useState("");

    // Load user data when modal opens
    useEffect(() => {
        if (open && user) {
            setName(user.name || "");
            setPhone(user.phone || "");
            setCompany(user.company || "");
            setBillingAddress(user.billingAddress || "");
            setBillingCity(user.billingCity || "");
            setBillingCountry(user.billingCountry || "");
            setBillingPostalCode(user.billingPostalCode || "");
        }
    }, [open, user]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                setError("No authentication token found");
                setLoading(false);
                return;
            }
            const response = await fetch(`${API_URL}/user/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name, 
                    phone: phone || null,
                    company: company || null,
                    billingAddress: billingAddress || null,
                    billingCity: billingCity || null,
                    billingCountry: billingCountry || null,
                    billingPostalCode: billingPostalCode || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to update profile" }));
                throw new Error(errorData.message || "Failed to update profile");
            }

            const updatedUser = await response.json() as User;

            // update LocalStorage user data
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setSuccess(true);
            setSuccessDialogOpen(true);

            // Call onUpdate callback to update parent if provided
            if (onUpdate) {
                onUpdate(updatedUser);
            }

           
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred");
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
                    borderRadius: 2,
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    pb: 1,
                    borderBottom: `1px solid ${theme.palette.brand.border}`,
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    color: theme.palette.brand.green,
                }}
            >
                Edit Profile
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 3, px: 3 }}>
                    <Stack spacing={3}>
                        {error && (
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    borderRadius: 2,
                                    "& .MuiAlert-icon": { color: "#d32f2f" }
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {/* Basic Information Section */}
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2.5, 
                                bgcolor: theme.palette.brand.lightBg,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.brand.border}`,
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.brand.dark,
                                    mb: 2,
                                    fontSize: "1.1rem"
                                }}
                            >
                                Basic Information
                            </Typography>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: "#fff",
                                        }
                                    }}
                                />
                                <TextField
                                    label="Email"
                                    value={user?.email || ""}
                                    fullWidth
                                    disabled
                                    helperText="Email cannot be changed"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: theme.palette.brand.lightBg,
                                        }
                                    }}
                                />
                                <TextField
                                    label="Phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: "#fff",
                                        }
                                    }}
                                />
                                <TextField
                                    label="Company"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: "#fff",
                                        }
                                    }}
                                />
                            </Stack>
                        </Paper>

                        {/* Billing Address Section */}
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2.5, 
                                bgcolor: theme.palette.brand.lightBg,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.brand.border}`,
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.brand.dark,
                                    mb: 2,
                                    fontSize: "1.1rem"
                                }}
                            >
                                Billing Address
                            </Typography>
                            <Stack spacing={2.5}>
                                <TextField
                                    label="Address"
                                    value={billingAddress}
                                    onChange={(e) => setBillingAddress(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: "#fff",
                                        }
                                    }}
                                />
                                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                    <TextField
                                        label="City"
                                        value={billingCity}
                                        onChange={(e) => setBillingCity(e.target.value)}
                                        fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                                bgcolor: "#fff",
                                            }
                                        }}
                                    />
                                    <TextField
                                        label="Country"
                                        value={billingCountry}
                                        onChange={(e) => setBillingCountry(e.target.value)}
                                        fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                                bgcolor: "#fff",
                                            }
                                        }}
                                    />
                                </Box>
                                <TextField
                                    label="Postal Code"
                                    value={billingPostalCode}
                                    onChange={(e) => setBillingPostalCode(e.target.value)}
                                    fullWidth
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            bgcolor: "#fff",
                                        }
                                    }}
                                />
                            </Stack>
                        </Paper>
                    </Stack>
                </DialogContent>
                <DialogActions 
                    sx={{ 
                        p: 2.5, 
                        pt: 2,
                        borderTop: `1px solid ${theme.palette.brand.border}`,
                        gap: 1.5
                    }}
                >
                    <Button 
                        onClick={onClose} 
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            textTransform: "none",
                            fontWeight: 500,
                            color: theme.palette.brand.muted,
                            "&:hover": {
                                bgcolor: theme.palette.brand.lightBg
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: theme.palette.brand.green,
                            "&:hover": {
                                bgcolor: theme.palette.brand.greenHover
                            },
                            "&:disabled": {
                                bgcolor: theme.palette.brand.border
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
                    </Button>
                </DialogActions>
            </form>
            {/* Success Dialog */}
            <Dialog 
                open={successDialogOpen} 
                onClose={() => {
                    setSuccessDialogOpen(false);
                    setSuccess(false);
                    onClose();
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }
                }}
            >
                <DialogTitle 
                    sx={{ 
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: theme.palette.brand.green,
                        pb: 1,
                        borderBottom: `1px solid ${theme.palette.brand.border}`
                    }}
                >
                    Profile Updated Successfully
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography>
                        Your profile has been updated successfully!
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, pt: 2, borderTop: `1px solid ${theme.palette.brand.border}` }}>
                    <Button 
                        onClick={() => {
                            setSuccessDialogOpen(false);
                            setSuccess(false);
                            onClose();
                        }} 
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: theme.palette.brand.green,
                            "&:hover": {
                                bgcolor: theme.palette.brand.greenHover,
                            }
                        }}
                    >
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    );
}
