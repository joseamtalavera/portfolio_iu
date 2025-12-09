import type { Metadata } from "next";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeWorking",
  description: "BeWorking is a Virtual Office platform for startups and freelancers",
};

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
