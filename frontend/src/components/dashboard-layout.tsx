"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ProfileModal from "@/components/profileModal";
import { User } from "@/types";
import { API_URL } from "@/config/constants";
import PaymentModal from "./paymentModal";


type NavKey = "dashboard" | "mailbox" | "bookings" | "profile" | "__logout__";

const navItems: { key: NavKey; label: string; icon: React.ReactNode; href?: string }[] = [
  { key: "dashboard", label: "Overview", icon: <DashboardOutlinedIcon />, href: "/dashboard" },
  { key: "mailbox", label: "Mailbox", icon: <MailOutlineIcon />, href: "/mailbox" },
  { key: "bookings", label: "Bookings", icon: <EventNoteOutlinedIcon />, href: "/bookings" },
  { key: "profile", label: "Profile", icon: <PersonOutlineIcon />, href: "/profile" },
  { key: "__logout__", label: "Log out", icon: <LogoutOutlinedIcon /> },
];

interface DashboardLayoutProps {
  active: NavKey; // active navigation item. Only one of the navItems keys can be active at a time.
  user?: User | null; // authenticated user data
  onLogout: () => void; // callback function to handle logout
  children: React.ReactNode; // child components to be rendered in the main content area
}

export function DashboardLayout({
  active,
  user,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); // Array destructuring useState returns an array with two elements: useState(false) → [stateValue, setterFunction]


  useEffect(() => {
    if (profileModalOpen) {
      const fetchUserProfile = async () => {
        const token = localStorage.getItem("jwt");
        if (!token) return;

        try {
          const response = await fetch(`${API_URL}/user/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json() as User;
            setCurrentUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      };

      fetchUserProfile();
    }
  }, [profileModalOpen]);

  useEffect(() => {
    // Check if user has an INACTIVE subscription status
    if (currentUser && currentUser?.subscriptionStatus === "INACTIVE") {
      setPaymentModalOpen(true); // the modal open and offer the user to pay for the subscription
    } else {
      setPaymentModalOpen(false);
    }
  }, [currentUser?.subscriptionStatus]);


  const handleNav = (item: typeof navItems[number]) => {
    if (item.key === "__logout__") {
      onLogout();
      return;
    }
    // Open modal for profile when clicking on profile item
    if (item.key === "profile") {
      setProfileModalOpen(true);
      return;
    }
    if (item.href) router.push(item.href);
  };

  const handleAvatarClick = () => {
    setProfileModalOpen(true);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Add a handler for payment success
  const handlePaymentSuccess = async () => {
    // Refresh user data after successful payment
    const token = localStorage.getItem("jwt");
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json() as User;
        setCurrentUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setPaymentModalOpen(false);
      }
    } catch (err) {
        console.error("Error fetching user profile after payment", err);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: theme.palette.brand.lightBg }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 230,
          bgcolor: "#fff",
          borderRight: `1px solid ${theme.palette.brand.border}`,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2 }}>
          <Box
            component="img"
            src="/beworking_logo_h40_3x.png"
            alt="BeWorking"
            sx={{ height: 32, width: "auto", display: "block" }}
          />
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
                  "&.Mui-selected": {
                    bgcolor: theme.palette.brand.accentSoft,
                    color: theme.palette.brand.green,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: item.key === active ? theme.palette.brand.green : theme.palette.brand.muted,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{ 
                    color: item.key === active ? theme.palette.brand.green : theme.palette.brand.muted,
                    "& .MuiListItemText-primary": {
                      color: item.key === active ? theme.palette.brand.green : theme.palette.brand.muted,
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box 
        sx={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          minWidth: 0, // Allow flex item to shrink below content size
          overflow: "hidden", // Prevent horizontal overflow
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: "#fff", color: "inherit", borderBottom: `1px solid ${theme.palette.brand.border}` }}
        >
          <Toolbar sx={{ justifyContent: "flex-end" }}>
            <Avatar 
              sx={{ bgcolor: theme.palette.brand.green, cursor: "pointer" }}
              onClick={handleAvatarClick}
            >
              {(user?.name ?? "U").charAt(0).toUpperCase()}
            </Avatar>
          </Toolbar>
        </AppBar>

        <Container 
          maxWidth={false} 
          sx={{ 
            flex: 1, 
            py: 3, 
            width: "100%", 
            maxWidth: "100%", 
            px: { xs: 2, sm: 3 },
            overflow: "hidden", // Prevent horizontal overflow
            boxSizing: "border-box",
          }}
        >
          {children}
        </Container>
      </Box>
      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={currentUser || user || null}
        onUpdate={handleProfileUpdate}
      />
      <PaymentModal
          open={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
          }}
          onSuccess={handlePaymentSuccess}
        />
    </Box>
  );
}
