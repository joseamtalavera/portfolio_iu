"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    AppBar,
  Avatar,
  Box,
  Button,
  Chip,
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
  Alert,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

type MailItem = {
    id: number;
    subject: string;
    message: string;
    timestamp: string;
}

const navItems = [
    { label: "Overview", icon: <DashboardIcon />, href: "/dashboard" },
    { label: "Mailbox", icon: <MailOutlineIcon />, href: "/mailbox" },
    { label: "Bookings", icon: <EventSeatIcon />, href: "/bookings" },
    { label: "Profile", icon: <SettingsIcon />, href: "/profile" },
    { label: "Log out", icon: <SettingsIcon />, href: "__logout__" },
  ];

  export default function MailboxPage() {
    const router = useRouter();
    const [loaded, setLoaded] = useState(false);
    // Store authenticated user data (name and email) - null if not loaded yet
    const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
    const [mail, setMail] = useState<MailItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Handle navigation clicks - special case for logout, otherwise navigate to href
    const handleNav = (href: string) => {
        // If logout is clicked, clear authentication data and redirect to login
        if (href === "__logout__") {
            localStorage.removeItem("jwt");
            localStorage.removeItem("user");
            router.push("/login");
            return;
        }
        // Navigate to the specified route
        router.push(href);
    };

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
                console.error("Failed to parse user data:", error);
                // Clear corrupted data if parsing fails
                localStorage.removeItem("user");
            }
        }

        const loadMail = async () => {
            try {
                const response = await fetch(`${API_URL}/mailbox`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    });
                if (!response.ok) {
                    throw new Error("Failed to fetch mailbox items");
                }
                const data = await response.json();
                setMail(data);
            } catch (error) {
                setError(erro instanceof Error? error.message : "An unknown error occurred");
            } finally {
                setLoaded(true);
            }
        };

        loadMail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

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
                selected={item.href === "/mailbox"}
                onClick={() => handleNav(item.href)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  "&.Mui-selected": { bgcolor: "#e8f6ef", color: "#2ecc71" },
                }}
              >
                <ListItemIcon sx={{ color: item.href === "/mailbox" ? "#2ecc71" : "inherit" }}>
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
        
      </Box>


  }