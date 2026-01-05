
import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    brand: {
      green: string;
      greenHover: string;
      dark: string;
      muted: string;
      yellow: string;
      lightBg: string;
      border: string;
      borderSoft: string;
      accentSoft: string;
    };
  }
  interface PaletteOptions {
    brand?: Palette["brand"];
  }
}

export const theme = createTheme({
  palette: {
    mode: "light",
    brand: {
      green: "#2ecc71",
      greenHover: "#27ae60",
      dark: "#2f3b46",
      muted: "#6b747d",
      yellow: "#f7a200",
      lightBg: "#f6f8fb",
      border: "#e5e7eb",
      borderSoft: "#eef1f4",
      accentSoft: "rgba(46,204,113,0.08)",
    },
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12 },
        outlined: ({ theme }) => ({
          borderColor: theme.palette.brand.green,
          color: theme.palette.brand.green,
          "&:hover": {
            backgroundColor: theme.palette.brand.accentSoft,
            borderColor: theme.palette.brand.green,
          },
        }),
        contained: ({ theme }) => ({
          backgroundColor: theme.palette.brand.green,
          "&:hover": { backgroundColor: theme.palette.brand.greenHover },
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        InputProps: { sx: { bgcolor: "#f9fafb", borderRadius: 1.2 } },
      },
    },
  },
});
