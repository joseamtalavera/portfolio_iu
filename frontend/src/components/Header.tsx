"use client";

/**
 * Public header bar with logo and optional call-to-action button.
 */
import Link from "next/link";
import Image from "next/image";
import { AppBar, Toolbar, Container, Box, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Header configuration for optional CTA rendering.
 */
type HeaderProps = {
  ctaLabel?: string;
  ctaHref?: string;
  hideCta?: boolean;
};

/**
 * Renders the public site header.
 *
 * @param ctaLabel button label (optional)
 * @param ctaHref link target for the CTA (optional)
 * @param hideCta hides the CTA button when true
 * @returns header element
 */
export function Header({ ctaLabel, ctaHref, hideCta = false }: HeaderProps) {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        position: { xs: "fixed", md: "static" },
        top: { xs: 0, md: "auto" },
        zIndex: theme.zIndex.appBar,
        bgcolor: "#fff",
        color: theme.palette.brand.dark,
        borderBottom: `1px solid ${theme.palette.brand.borderSoft}`,
        py: 0,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", minHeight: 44, py: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <Image
                src="/beworking_logo_clean.svg"
                alt="BeWorking logo"
                width={150}
                height={40}
                priority
              />
            </Link>
          </Box>

          {!hideCta && ctaLabel && ctaHref ? (
            <Button
              component={Link}
              href={ctaHref}
              variant="outlined"
              sx={{
                borderColor: theme.palette.brand.green,
                color: theme.palette.brand.green,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 1.2,
                px: 2.8,
                py: 0.9,
                fontSize: "0.95rem",
                minHeight: 0,
                "&:hover": {
                  borderColor: theme.palette.brand.green,
                  bgcolor: theme.palette.brand.accentSoft,
                },
              }}
            >
              {ctaLabel}
            </Button>
          ) : null}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
