"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { useTheme } from "@mui/material/styles";
import { FrontLayout } from "@/components/FrontLayout";
import { API_URL } from "@/config/constants";

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!email.includes("@")) return "Invalid email address";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FrontLayout ctaLabel="CLIENT ACCESS" ctaHref="/login">
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 }, flex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "7fr 5fr" },
            columnGap: { xs: 0, md: 6 },
            rowGap: { xs: 4, md: 0 },
            alignItems: "start",
          }}
        >
          <Box>
            <Stack spacing={4}>
              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "2.4rem", md: "3.5rem" },
                    fontWeight: 400,
                    lineHeight: 1.15,
                    color: theme.palette.brand.dark,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Your Virtual Office in Tallinn
                </Typography>
              </Box>

              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography
                  sx={{
                    fontSize: { xs: "2.8rem", md: "3.6rem" },
                    fontWeight: 800,
                    color: theme.palette.brand.yellow,
                    lineHeight: 1,
                  }}
                >
                  €15
                </Typography>
                <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: theme.palette.brand.muted }}>
                  /month
                </Typography>
              </Stack>

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 26,
                    bgcolor: theme.palette.brand.green,
                    borderRadius: 2,
                    mt: 0.4,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontSize: "1.5rem", color: theme.palette.brand.dark, fontWeight: 500 }}>
                  Focus on your business — we take care of the rest.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "column" }} spacing={3} flexWrap="wrap" rowGap={1.5}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <LocationCityIcon sx={{ color: theme.palette.brand.green }} />
                  <Typography sx={{ color: theme.palette.brand.dark }}>
                    Immediate Registered and Tax Address.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <MarkEmailReadIcon sx={{ color: theme.palette.brand.green }} />
                  <Typography sx={{ color: theme.palette.brand.dark }}>
                    Daily mail and parcel management.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <EventAvailableIcon sx={{ color: theme.palette.brand.green }} />
                  <Typography sx={{ color: theme.palette.brand.dark }}>
                    Free meeting room booking.
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              justifySelf: { md: "end" },
              width: "100%",
              maxWidth: 420,
            }}
          >
            <Paper
              elevation={6}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                bgcolor: "#fff",
                boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
              }}
            >
              <Stack spacing={1.5} mb={2}>
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <AutoAwesomeIcon sx={{ color: "#f5c44f" }} />
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: theme.palette.brand.dark }}>
                    Activate Your Virtual Office
                  </Typography>
                </Stack>
                <Typography sx={{ color: theme.palette.brand.muted, fontSize: "0.95rem" }}>
                  Leave your details and we will contact you without any obligation.
                </Typography>
              </Stack>

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2.2}>
                  {error && <Alert severity="error">{error}</Alert>}
                  {success && <Alert severity="success">{success}</Alert>}

                  <TextField
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    InputProps={{ sx: { bgcolor: "#f9fafb", borderRadius: 1.2 } }}
                  />
                  <TextField
                    placeholder="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                    InputProps={{ sx: { bgcolor: "#f9fafb", borderRadius: 1.2 } }}
                  />
                  <TextField
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    required
                    helperText="At least 6 characters"
                    InputProps={{ sx: { bgcolor: "#f9fafb", borderRadius: 1.2 } }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    startIcon={<WarningAmberIcon />}
                    sx={{
                      bgcolor: theme.palette.brand.green,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      py: 1.4,
                      borderRadius: 1.2,
                      boxShadow: "0 8px 18px rgba(39,179,106,0.25)",
                      "&:hover": {
                        bgcolor: theme.palette.brand.greenHover,
                        boxShadow: "0 10px 20px rgba(39,179,106,0.3)",
                      },
                    }}
                  >
                    REQUEST YOUR VIRTUAL OFFICE
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </FrontLayout>
  );
}
