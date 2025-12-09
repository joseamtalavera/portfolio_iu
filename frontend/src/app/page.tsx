"use client"

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api"; // API URL for the backend

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
