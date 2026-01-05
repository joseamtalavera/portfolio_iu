"use client"

/**
 * LOGIN PAGE - Authentication Entry Point
 * 
 * This component handles user authentication and initiates the JWT token lifecycle.
 * 
 * AUTHENTICATION FLOW OVERVIEW:
 * 1. User enters credentials → Login request sent to backend
 * 2. Backend validates → Returns JWT token + user data
 * 3. Token stored in localStorage → Available for all future requests
 * 4. Subsequent API calls include token → Backend validates and grants access
 * 5. Token expires → User must login again (or implement refresh token)
 * 
 * TOKEN USAGE IN OTHER COMPONENTS:
 * To make authenticated API calls, retrieve the token and include it in headers:
 * 
 *   const token = localStorage.getItem("jwt");
 *   const response = await fetch(`${API_URL}/user/me`, {
 *     headers: {
 *       "Authorization": `Bearer ${token}`,
 *       "Content-Type": "application/json"
 *     }
 *   });
 * 
 * BACKEND VALIDATION:
 * The backend's JwtAuthenticationFilter automatically:
 * - Extracts token from Authorization header
 * - Validates token signature and expiration
 * - Sets authenticated user in security context
 * - Allows access to protected endpoints (/api/user/me, /api/bookings, etc.)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FrontLayout } from "@/components/FrontLayout";
import { API_URL } from "@/config/constants";

export default function Login() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState(""); // State stores the value of the email input field
  const [password, setPassword] = useState(""); // State stores the value of the password input field
  const [error, setError] = useState<string | null>(null); // Error message to display to the user when login fails
  const [loading, setLoading] = useState(false); // Loading state to display a loading spinner while the login is in progress


  const validate = () => {
    if (!email.includes("@")) return "Invalid email address";
    if (!password.trim()) return "Password is required";
    return null;
  }

  /**
   * AUTHENTICATION CYCLE - Complete Flow Explanation
   * 
   * STEP 1: LOGIN REQUEST
   * User submits credentials → Frontend sends POST to /api/auth/login
   * Backend validates credentials → Returns JWT token + user data
   * 
   * STEP 2: TOKEN STORAGE (This function)
   * Token is stored in localStorage → Persists across page refreshes
   * User data is stored → Available immediately without API calls
   * 
   * STEP 3: TOKEN USAGE IN SUBSEQUENT REQUESTS
   * When making authenticated API calls (e.g., GET /api/user/me, POST /api/bookings):
   *   1. Retrieve token: const token = localStorage.getItem("jwt")
   *   2. Add to request headers: Authorization: `Bearer ${token}`
   *   3. Backend validates token → Grants access to protected resources
   * 
   * STEP 4: TOKEN VALIDATION (Backend)
   * Backend JwtAuthenticationFilter intercepts requests
   * Extracts token from Authorization header
   * Validates signature and expiration
   * Sets authenticated user in security context
   * 
   * STEP 5: TOKEN EXPIRATION
   * Token expires after jwt.expiration-ms (default: 1 hour)
   * On expiration: Backend returns 401 Unauthorized
   * Frontend should: Clear localStorage and redirect to login
   * 
   * STEP 6: LOGOUT
   * Remove token: localStorage.removeItem("jwt")
   * Remove user: localStorage.removeItem("user")
   * Redirect to login page
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(null); // Clear any previous errors
   
    const validationError = validate(); // Validate the form data
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // STEP 1: Send login request to backend
      // Backend endpoint: POST /api/auth/login
      // Backend validates email/password and returns JWT token if valid
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Login failed");
        return;
      }

      // Parse the JSON response from the API
      const data = await response.json();

      // Destructure the response to extract token and user data
      // Type assertion ensures TypeScript knows the shape of the response:
      // - token: required JWT string for authentication
      // - user: optional object containing user profile information
      const { token, user } = data as {
        token: string;
        user?: {
          id: number;
          name: string;
          email: string;
        };
      }

      // STEP 2: Store JWT token in localStorage
      // This token will be used for ALL subsequent authenticated API requests
      // Example usage in other components:
      //   const token = localStorage.getItem("jwt");
      //   fetch(`${API_URL}/user/me`, {
      //     headers: { "Authorization": `Bearer ${token}` }
      //   })
      localStorage.setItem("jwt", token);
      
      // Store user data in localStorage if available
      // This allows the app to display user info without making additional API calls
      // JSON.stringify converts the user object to a string for storage
      // To retrieve: const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      // STEP 3: Redirect to dashboard
      // The dashboard will use the stored token to make authenticated requests
      // Token is automatically included in all API calls via Authorization header
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again later.");
  } finally {
    setLoading(false);
  }
}

  return (
    <FrontLayout ctaLabel="CLIENT ACCESS" ctaHref="/" hideCta>
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 4, md: 8 },
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            width: "100%",
            boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
          }}
        >
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.brand.dark }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.brand.muted }}>
              Login to access your BeWorking account.
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.4}>
              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                InputProps={{ sx: { bgcolor: "#f9fafb", borderRadius: 1.2 } }}
              />
              <TextField
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                InputProps={{ sx: { bgcolor: "#f9fafb", borderRadius: 1.2 } }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: theme.palette.brand.green,
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  py: 1.3,
                  borderRadius: 1.2,
                  boxShadow: "0 8px 18px rgba(39,179,106,0.25)",
                  "&:hover": {
                    bgcolor: theme.palette.brand.greenHover,
                    boxShadow: "0 10px 20px rgba(39,179,106,0.3)",
                  },
                }}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button
                variant="text"
                onClick={() => router.push("/")}
                disabled={loading}
                sx={(theme) => ({
                  textTransform: "none",
                  fontWeight: 600,
                  color: theme.palette.brand.green,
                  "&:hover": { color: theme.palette.brand.greenHover, backgroundColor: "transparent" },
                })}
              >
                Need an account? Register
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </FrontLayout>
  );
}
