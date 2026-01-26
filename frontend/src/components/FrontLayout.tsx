"use client";

/**
 * Layout wrapper for public (non-dashboard) pages.
 */
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Wraps public pages with header, footer, and background styling.
 *
 * @param children page content
 * @param ctaLabel CTA label shown in the header
 * @param ctaHref CTA link target
 * @param hideCta hides the header CTA when true
 * @returns layout wrapper
 */
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
      <Box sx={{ flex: 1, pt: { xs: "56px", md: 0 } }}>{children}</Box>
      <Footer />
    </Box>
  );
}
