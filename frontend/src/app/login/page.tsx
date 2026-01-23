"use client";
/**
 * Public landing and login page.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { FrontLayout } from "@/components/FrontLayout";
import { loginUser, validateLogin } from "@/utils/auth";

/**
 * Renders the login page and handles authentication flow.
 *
 * @returns page component
 */
export default function Login() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false); 


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(null); 
   
    const validationError = validateLogin(email, password); 
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);

      localStorage.setItem("jwt", token);
      
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
                InputProps={{ sx: { bgcolor: theme.palette.brand.lightBg, borderRadius: 1.2 } }}
              />
              <TextField
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                InputProps={{ sx: { bgcolor: theme.palette.brand.lightBg, borderRadius: 1.2 } }}
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
