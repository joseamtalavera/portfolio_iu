"use client";
/**
 * Client-side providers for MUI theme and baseline styles.
 */
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../theme";

/**
 * Wraps children with theme providers that must run on the client.
 *
 * @param children page content
 * @returns provider tree
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
