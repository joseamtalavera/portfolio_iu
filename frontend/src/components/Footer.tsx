"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export function Footer() {
  const theme = useTheme();
  return (
    <Box sx={{ borderTop: `1px solid ${theme.palette.brand.border}`, bgcolor: "#fff", py: 4 }}>
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography sx={{ color: theme.palette.brand.muted, fontSize: "0.85rem" }}>
            © 2025 BeWorking — Academic Project
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
