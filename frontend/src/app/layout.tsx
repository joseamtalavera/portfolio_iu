"use client";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../theme";
import "./globals.css";

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
