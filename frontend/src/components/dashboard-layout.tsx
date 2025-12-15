"use client";

import { useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";

type NavKey = "dashboard" | "mailbox" | "bookings" | "profile" | "__logout__";

const navItems: { key: NavKey; label: string; icon: React.ReactNode; href?: string }[] = [
  { key: "dashboard", label: "Overview", icon: <DashboardIcon />, href: "/dashboard" },
  { key: "mailbox", label: "Mailbox", icon: <MailOutlineIcon />, href: "/mailbox" },
  { key: "bookings", label: "Bookings", icon: <EventSeatIcon />, href: "/bookings" },
  { key: "profile", label: "Profile", icon: <SettingsIcon />, href: "/profile" },
  { key: "__logout__", label: "Log out", icon: <SettingsIcon /> },
];

interface DashboardLayoutProps {
  active: NavKey;
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
  children: React.ReactNode;
  searchPlaceholder?: string;
}

export function DashboardLayout({
  active,
  userName,
  userEmail,
  onLogout,
  children,
  searchPlaceholder = "Search…",
}: DashboardLayoutProps) {
  const router = useRouter();

  const handleNav = (item: typeof navItems[number]) => {
    if (item.key === "__logout__") {
      onLogout();
      return;
    }
    if (item.href) router.push(item.href);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#f4f7fb" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 230,
          bgcolor: "#fff",
          borderRight: "1px solid #e5e7eb",
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
          <Box sx={{ width: 10, height: 10, bgcolor: "#2ecc71", borderRadius: "50%" }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#2ecc71" }}>
            beworking
          </Typography>
        </Stack>
        <Divider />
        <List sx={{ flex: 1 }}>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                selected={item.key === active}
                onClick={() => handleNav(item)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  "&.Mui-selected": { bgcolor: "#e8f6ef", color: "#2ecc71" },
                }}
              >
                <ListItemIcon sx={{ color: item.key === active ? "#2ecc71" : "inherit" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: "#fff", color: "inherit", borderBottom: "1px solid #e5e7eb" }}>
          <Toolbar sx={{ gap: 2 }}>
            <Box sx={{ flex: 1, display: "flex", gap: 2, alignItems: "center" }}>
              <Paper
                sx={{
                  p: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  width: 320,
                  border: "1px solid #e5e7eb",
                }}
              >
                <IconButton size="small">
                  <SearchIcon />
                </IconButton>
                <InputBase sx={{ ml: 1, flex: 1 }} placeholder={searchPlaceholder} />
              </Paper>
            </Box>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "#2ecc71" }}>
              {(userName ?? "U").charAt(0).toUpperCase()}
            </Avatar>
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ flex: 1, py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
