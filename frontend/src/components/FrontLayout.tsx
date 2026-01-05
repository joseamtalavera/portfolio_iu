"use client";

import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function FrontLayout({
  children,
  ctaLabel,
  ctaHref,
  hideCta = false,
}: {
  children: React.ReactNode;
  ctaLabel: string;
  ctaHref: string;
  hideCta?: boolean;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.brand.lightBg,
        color: theme.palette.brand.dark,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header ctaLabel={ctaLabel} ctaHref={ctaHref} hideCta={hideCta} />
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Footer />
    </Box>
  );
}
