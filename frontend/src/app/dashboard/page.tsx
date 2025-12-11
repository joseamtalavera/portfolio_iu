"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Button,
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
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

const navItems = [
  { label: "Overview", icon: <DashboardIcon />, href: "/dashboard" },
  { label: "Mailbox", icon: <MailOutlineIcon />, href: "/mailbox" },
  { label: "Bookings", icon: <EventSeatIcon />, href: "/bookings" },
  { label: "Invoices", icon: <EventSeatIcon />, href: "/invoices" },
  { label: "Profile", icon: <SettingsIcon />, href: "/profile" },
  { label: "Log out", icon: <SettingsIcon />, href: "__logout__" },
];

const statCards = [
  { title: "Mailbox received", value: "12" },
  { title: "Bookings this month", value: "8" },
  { title: "Expenditure this month", value: "€4.2k" },
  { title: "Virtual Office status", value: "Active" },
];

export default function DashboardContent() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false); // Prevent flash of unauthenticated content
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null); // User data from localStorage

  useEffect(() => {
    // Check authentication and redirect to login if no JWT token
    const token = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        /* ignore parse errors */
      }
    }
    setLoaded(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleNav = (href: string) => {
    if (href === "__logout__") {
      handleLogout();
      return;
    }
    router.push(href);
  };

  if (!loaded) return null;

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
                selected={item.href === "/dashboard"}
                onClick={() => handleNav(item.href)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  "&.Mui-selected": { bgcolor: "#e8f6ef", color: "#2ecc71" },
                }}
              >
                <ListItemIcon sx={{ color: item.href === "/dashboard" ? "#2ecc71" : "inherit" }}>
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
        {/* Top bar */}
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
                <InputBase sx={{ ml: 1, flex: 1 }} placeholder="Search tenants, rooms, automations" />
              </Paper>
            </Box>
            <IconButton>
              <NotificationsNoneIcon />
            </IconButton>
            <Avatar sx={{ bgcolor: "#2ecc71" }}>
              {(user?.name ?? "U").charAt(0).toUpperCase()}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Body */}
        <Container maxWidth={false} sx={{ flex: 1, py: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Good evening{user?.name ? `, ${user.name}` : ""}. Here&apos;s the latest across your spaces.
              </Typography>
            </Box>

            {/* Stat cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(auto-fit, minmax(220px, 1fr))", lg: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              {statCards.map((card) => (
                <Paper key={card.title} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {card.title.toUpperCase()}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Today
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Upcoming bookings placeholder */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Upcoming bookings
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your next scheduled reservations will appear here.
                  </Typography>
                </Box>
                <Button variant="contained" color="success" sx={{ textTransform: "none" }} onClick={() => router.push("/bookings")}>
                  Manage bookings
                </Button>
              </Stack>
              <Box sx={{ mt: 3, height: 120, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #e5e7eb" }} />
            </Paper>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
