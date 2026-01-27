"use client";

/**
 * Dashboard layout with sidebar navigation, top bar, and profile/payment modals.
 */
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";


type NavKey = "dashboard" | "mailbox" | "bookings" | "profile" | "__logout__";

const PaymentModalContext = createContext<(() => void) | null>(null);

export function usePaymentModal() {
  return useContext(PaymentModalContext);
}

const navItems: { key: NavKey; label: string; icon: React.ReactNode; href?: string }[] = [
  { key: "dashboard", label: "Overview", icon: <DashboardOutlinedIcon />, href: "/dashboard" },
  { key: "mailbox", label: "Mailbox", icon: <MailOutlineIcon />, href: "/mailbox" },
  { key: "bookings", label: "Bookings", icon: <EventNoteOutlinedIcon />, href: "/bookings" },
  { key: "profile", label: "Profile", icon: <PersonOutlineIcon />, href: "/profile" },
  { key: "__logout__", label: "Log out", icon: <LogoutOutlinedIcon /> },
];

/**
 * Props for the dashboard layout component.
 */
interface DashboardLayoutProps {
  active: NavKey; // active navigation item. Only one of the navItems keys can be active at a time.
  user?: User | null; // authenticated user data
  onLogout: () => void; // callback function to handle logout
  paywallReady?: boolean; // whether the page is ready to show the paywall modal. We make sure that the content of the page is visible.
  children: React.ReactNode; // child components to be rendered in the main content area
}

/**
 * Renders the authenticated dashboard shell and handles profile/payment modals.
 *
 * @param active active navigation key
 * @param user current user (optional)
 * @param onLogout logout handler
 * @param children page content
 * @returns dashboard layout element
 */
export function DashboardLayout({
  active,
  user,
  onLogout,
  paywallReady = true,
  children,
}: DashboardLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false); // Array destructuring useState returns an array with two elements: useState(false) → [stateValue, setterFunction]
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileToggle = () => setMobileOpen((prev) => !prev);

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
    if (!paywallReady) return;
    const shouldShowPaywall = searchParams.get("paywall") === "1";
    if (!shouldShowPaywall) return;

    // The browser has drawn the page content on screen before the modals is shown
    if (typeof window !== "undefined") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPaymentModalOpen(true);
        });
      });
    } else {
      setPaymentModalOpen(true);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("paywall");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, paywallReady, router, searchParams]);

  const openPaymentModal = () => setPaymentModalOpen(true);

  const handleNav = (item: typeof navItems[number]) => {
    if (item.key === "__logout__") {
      onLogout();
      return;
    }
    const isInactive = (currentUser?.subscriptionStatus ?? "INACTIVE") === "INACTIVE";
    // Open modal for profile when clicking on profile item
    if (item.key === "profile") {
      setProfileModalOpen(true);
      return;
    }
    if (item.href) {
      const target = isInactive && item.key !== "dashboard"
        ? `${item.href}?paywall=1` // appends ?paywall=1 to the route
        : item.href;
      router.push(target);
    }
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
    <PaymentModalContext.Provider value={openPaymentModal}>
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
            src="/beworking_logo_clean.svg"
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

      {/* Mobile drawer */}
      <Drawer
        open={mobileOpen}
        onClose={handleMobileToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: 230 },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            component="img"
            src="/beworking_logo_clean.svg"
            alt="BeWorking"
            sx={{ height: 32, width: "auto", display: "block", mb: 1}}
          />
          <Divider />
        </Box>
        <List>
          {navItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                selected={item.key === active}
                onClick={() => {
                  handleNav(item);
                  setMobileOpen(false);
                }}
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
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

      </Drawer>


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
          sx={{ 
            position: { xs: "fixed", md: "static" },
            top: { xs: 0, md: "auto" },
            zIndex: theme.zIndex.appBar,
            bgcolor: "#fff", 
            color: "inherit", 
            borderBottom: `1px solid ${theme.palette.brand.border}` 
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <IconButton
              onClick={handleMobileToggle}
              sx={{ display: { xs: "inline-flex", md: "none" }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flex: 1 }} /> {/* Spacer to push avatar to the right */}
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
            pt: { xs: "80px", md: 3 }, // Add padding-top on mobile to account for fixed AppBar
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
            router.push("/dashboard");
          }}
        />
      </Box>
    </PaymentModalContext.Provider>
  );
}
