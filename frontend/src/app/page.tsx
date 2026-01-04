/* "use client"

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
import { API_URL } from "@/config/constants";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState(""); // State stores the value of the name input field
  const [email, setEmail] = useState(""); // State stores the value of the email input field
  const [password, setPassword] = useState(""); // State stores the value of the password input field
  const [error, setError] = useState<string | null>(null); // Error message to display to the user when registration fails
  const [success, setSuccess] = useState<string | null>(null); // Success message to display to the user when registration succeeds
  const [loading, setLoading] = useState(false); // Loading state to display a loading spinner while the registration is in progress

  const validate = () => {
    if (!name.trim()) return "Name is required";
    if (!email.includes("@")) return "Invalid email address";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(null); // Clear any previous errors
    setSuccess(null); // Clear any previous success messages

    const validationError = validate(); // Validate the form data
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password }),
      });  

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch {
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
  <Container maxWidth="sm" sx={{ py: 4}}>
    <Paper elevation={3} sx={{ p: 4}}>
      <Typography variant="h4" gutterBottom>
        Create an Account
      </Typography>
      <Typography variant="body1" sx={{ mb: 3}}>
        Welcome to BeWorking. Please Register to get started.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText="At least 6 characters"
          />
          <Button 
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
          <Button 
            variant="text"
            onClick={() => router.push("/login")}
            disabled={loading}
          >
            Already have an account? Login
          </Button>
        </Stack>
      </Box>
    </Paper>
  </Container>
  );
}
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import { API_URL } from "@/config/constants";

const brandGreen = "#2ecc71";
const brandDark = "#2f3b46";
const brandMuted = "#6b747d";
const brandYellow = "#f7a200";
const bgLight = "#f6f8fb";

export default function Home() {
  const router = useRouter();
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
    <Box sx={{ minHeight: "100vh", bgcolor: bgLight, color: brandDark, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: "#fff",
          color: brandDark,
          borderBottom: "1px solid #eef1f4",
          py: 0.5,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              minHeight: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              component="img"
              src="/beworking_logo_h40_3x.png"
              alt="BeWorking"
              sx={{ height: 40, width: "auto", display: "block" }}
            />

            <Stack direction="row" alignItems="center" spacing={3}>
              
              <Button
                variant="outlined"
                sx={{
                  borderColor: brandGreen,
                  color: brandGreen,
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 1.2,
                  px: 2.8,
                  py: 1,
                  "&:hover": { borderColor: brandGreen, bgcolor: "rgba(39,179,106,0.08)" },
                }}
                onClick={() => router.push("/login")}
              >
                CLIENT ACCESS
              </Button>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main */}
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
          {/* Left column (hero) */}
          <Box>
            <Stack spacing={4}>
              <Box>
                <Typography
                  component="h1"
                  sx={{
                    fontSize: { xs: "2.4rem", md: "3.5rem" },
                    fontWeight: 400,
                    lineHeight: 1.15,
                    color: brandDark,
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
                    color: brandYellow,
                    lineHeight: 1,
                  }}
                >
                  €15
                </Typography>
                <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: brandMuted }}>
                  /month
                </Typography>
              </Stack>

              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 26,
                    bgcolor: brandGreen,
                    borderRadius: 2,
                    mt: 0.4,
                    flexShrink: 0,
                  }}
                />
                <Typography sx={{ fontSize: "1.5rem", color: brandDark, fontWeight: 500 }}>
                  Focus on your business — we take care of the rest.
                </Typography>
              </Box>

              <Stack direction={{ xs: "column", sm: "column" }} spacing={3} flexWrap="wrap" rowGap={1.5}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <LocationCityIcon sx={{ color: brandGreen }} />
                  <Typography sx={{ color: brandDark }}>
                    Immediate Registered and Tax Address.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <MarkEmailReadIcon sx={{ color: brandGreen }} />
                  <Typography sx={{ color: brandDark }}>
                    Daily mail and parcel management.
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <EventAvailableIcon sx={{ color: brandGreen }} />
                  <Typography sx={{ color: brandDark }}>
                    Free meeting room booking.
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* Right column (form) */}
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
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: brandDark }}>
                    Activate Your Virtual Office
                  </Typography>
                </Stack>
                <Typography sx={{ color: brandMuted, fontSize: "0.95rem" }}>
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
                    startIcon={<WarningAmberIcon />}
                    disabled={loading}
                    sx={{
                      bgcolor: brandGreen,
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      py: 1.4,
                      borderRadius: 1.2,
                      boxShadow: "0 8px 18px rgba(39,179,106,0.25)",
                      "&:hover": { bgcolor: "#1f9b59", boxShadow: "0 10px 20px rgba(39,179,106,0.3)" },
                    }}
                  >
                    {loading ? "Submitting..." : "REQUEST YOUR VIRTUAL OFFICE"}
                  </Button>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          borderTop: "1px solid #e6e9ed",
          bgcolor: "#fff",
          py: 4,
          mt: { xs: 4, md: 2 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography sx={{ color: brandMuted, fontSize: "0.85rem" }}>
              © 2024 BEWORKING MÁLAGA — ACADEMIC PROJECT
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography sx={{ color: brandMuted, fontSize: "0.85rem" }}>
                TERMS & CONDITIONS
              </Typography>
              <Typography sx={{ color: brandMuted, fontSize: "0.85rem" }}>
                PRIVACY POLICY
              </Typography>
              <Typography sx={{ color: brandMuted, fontSize: "0.85rem" }}>
                ACCESSIBILITY
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
