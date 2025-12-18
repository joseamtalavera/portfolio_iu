"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Availability } from "@/components/availability";
import { API_URL } from "@/config/constants";
import { Booking, RoomAvailability, TimeSlot, User } from "@/types";
import DeleteIcon from "@mui/icons-material/Delete";

function TabPanel({ value, index, children }: { value: number; index: number; children: React.ReactNode }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

export default function BookingsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0); // Default to Calendar tab (index 0)
  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const slots = useMemo<TimeSlot[]>(() => {
    const result: TimeSlot[] = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 23 && minute > 0) break; // stop at 23:00
        const hh = String(hour).padStart(2, "0");
        const mm = String(minute).padStart(2, "0");
        const label = `${hh}:${mm}`;
        result.push({ label, value: label });
      }
    }
    return result;
  }, []);
  // Update booked slots based on selected date and bookings
  const rooms = useMemo<RoomAvailability[]>(() => {
    // Filter bookings for the selected date
    // Handle both YYYY-MM-DD format and other possible formats
    const dateBookings = bookings.filter((booking) => {
      // Normalize date formats for comparison
      const bookingDate = booking.date.split('T')[0]; // Remove time if present
      const selectedDateNormalized = selectedDate.split('T')[0];
      return bookingDate === selectedDateNormalized;
    });
    
    // Extract booked time slots for "Meeting Room"
    const bookedSlots: string[] = [];
    dateBookings.forEach((booking) => {
      if (booking.product === "Meeting Room") {
        // Parse time, handling both HH:MM and HH:MM:SS formats
        const parseTime = (timeStr: string) => {
          const parts = timeStr.split(':').map(Number);
          return parts[0] * 60 + (parts[1] || 0); // Ignore seconds if present
        };
        
        const startMinutes = parseTime(booking.startHour);
        const endMinutes = parseTime(booking.endHour);
        
        // Round start to nearest 30-minute slot (round down)
        const roundedStart = Math.floor(startMinutes / 30) * 30;
        // Round end to nearest 30-minute slot (round up)
        const roundedEnd = Math.ceil(endMinutes / 30) * 30;
        
        // Generate all 30-minute slots between rounded start and end
        for (let minutes = roundedStart; minutes < roundedEnd; minutes += 30) {
          const hour = Math.floor(minutes / 60);
          const minute = minutes % 60;
          const slot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          bookedSlots.push(slot);
        }
      }
    });
    
    // Remove duplicates
    const uniqueBookedSlots = Array.from(new Set(bookedSlots));
    
    return [{ room: "Meeting Room", booked: uniqueBookedSlots }];
  }, [bookings, selectedDate]);

  const [form, setForm] = useState({
    product: "Meeting Room",
    date: "",
    startHour: "",
    endHour: "",
    attendees: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [deleteSuccessDialogOpen, setDeleteSuccessDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
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
        localStorage.removeItem("user");
      }
    }

    const loadBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(`Error fetching bookings: ${response.statusText}`);
        const data = (await response.json()) as Booking[];
        setBookings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    loadBookings();
  }, [router]);

  // Generate all time options with 30-minute intervals (07:00 to 23:00)
  const allTimeOptions = useMemo(() => {
    const options: string[] = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 23 && minute > 0) break; // Stop at 23:00
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
  }, []);

  // Filter available time options based on selected date, current time, and booked slots
  const availableTimeOptions = useMemo(() => {
    if (!form.date) return allTimeOptions;

    const today = new Date();
    const selectedDateObj = new Date(form.date);
    const isToday = selectedDateObj.toDateString() === today.toDateString();
    
    // Get booked slots for the selected date
    const dateBookings = bookings.filter((booking) => {
      const bookingDate = booking.date.split('T')[0];
      return bookingDate === form.date;
    });
    
    // Extract all booked time slots
    const bookedSlots = new Set<string>();
    dateBookings.forEach((booking) => {
      if (booking.product === "Meeting Room") {
        const parseTime = (timeStr: string) => {
          const parts = timeStr.split(':').map(Number);
          return parts[0] * 60 + (parts[1] || 0);
        };
        
        const startMinutes = parseTime(booking.startHour);
        const endMinutes = parseTime(booking.endHour);
        const roundedStart = Math.floor(startMinutes / 30) * 30;
        const roundedEnd = Math.ceil(endMinutes / 30) * 30;
        
        for (let minutes = roundedStart; minutes < roundedEnd; minutes += 30) {
          const hour = Math.floor(minutes / 60);
          const minute = minutes % 60;
          const slot = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          bookedSlots.add(slot);
        }
      }
    });
    
    // Filter time options
    return allTimeOptions.filter((time) => {
      // Exclude booked slots
      if (bookedSlots.has(time)) return false;
      
      // If selected date is today, exclude past times
      if (isToday) {
        const [hours, minutes] = time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours, minutes, 0, 0);
        const now = new Date();
        // Add 30 minutes buffer - can't book if less than 30 minutes from now
        const bufferTime = new Date(now.getTime() + 30 * 60 * 1000);
        if (timeDate < bufferTime) return false;
      }
      
      return true;
    });
  }, [allTimeOptions, form.date, bookings]);

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === "attendees" ? Number(event.target.value) : event.target.value;
    
    setForm((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // If date changed, clear start and end hours to force re-selection
      if (field === "date") {
        updated.startHour = "";
        updated.endHour = "";
      }
      
      return updated;
    });
  };

  // Clear start/end hours if they're no longer available when date or bookings change
  useEffect(() => {
    if (form.date && (form.startHour || form.endHour)) {
      const startAvailable = !form.startHour || availableTimeOptions.includes(form.startHour);
      const endAvailable = !form.endHour || availableTimeOptions.includes(form.endHour);
      
      if (!startAvailable || !endAvailable) {
        setForm((prev) => ({
          ...prev,
          startHour: startAvailable ? prev.startHour : "",
          endHour: endAvailable ? prev.endHour : "",
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.date, availableTimeOptions]);

  // Check if the selected time slot conflicts with existing bookings
  const checkForConflict = (date: string, startHour: string, endHour: string): boolean => {
    if (!date || !startHour || !endHour) return false;
    
    // Filter bookings for the same date
    const dateBookings = bookings.filter((booking) => {
      const bookingDate = booking.date.split('T')[0];
      return bookingDate === date;
    });
    
    // Parse time strings to minutes for comparison
    const parseTime = (timeStr: string): number => {
      const parts = timeStr.split(':').map(Number);
      return parts[0] * 60 + (parts[1] || 0);
    };
    
    const newStart = parseTime(startHour);
    const newEnd = parseTime(endHour);
    
    // Check for overlap with existing bookings
    for (const booking of dateBookings) {
      if (booking.product === "Meeting Room") {
        const existingStart = parseTime(booking.startHour);
        const existingEnd = parseTime(booking.endHour);
        
        // Check if time ranges overlap
        if (newStart < existingEnd && newEnd > existingStart) {
          return true; // Conflict found
        }
      }
    }
    
    return false; // No conflict
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
      return;
    }
    
    // Check for conflicts before submitting
    if (checkForConflict(form.date, form.startHour, form.endHour)) {
      setConflictDialogOpen(true);
      return;
    }
    
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create booking");
      }
      // Reset form on success
      setForm({ product: "Meeting Room", date: "", startHour: "", endHour: "", attendees: 1 });
      // Reload bookings list to show the new booking
      const bookingsResponse = await fetch(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bookingsResponse.ok) {
        const bookings = (await bookingsResponse.json()) as Booking[];
        setBookings(bookings);
      }
      // Show success dialog
      setSuccessDialogOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (bookingId: number) => {
    setBookingToDelete(bookingId);
    setDeleteConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingToDelete) return;
    
    const token = localStorage.getItem("jwt");
    if (!token) {
      router.replace("/login");
      return;
    }

    setDeleteConfirmDialogOpen(false);

    try {
      const response = await fetch(`${API_URL}/bookings/${bookingToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      // Remove the booking from the list
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingToDelete));
      
      // Show success dialog
      setDeleteSuccessDialogOpen(true);
      setBookingToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete booking");
      setBookingToDelete(null);
    }
  };

  if (!ready) {
    return null;
  }


  return (
    <DashboardLayout
      active="bookings"
      userName={user?.name}
      userEmail={user?.email}
      onLogout={handleLogout}
      searchPlaceholder="Search bookings"
    >
      <Stack spacing={3} sx={{ width: "100%", maxWidth: "100%" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Bookings
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            Create and manage your bookings.
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper 
          sx={{ 
            borderRadius: 3, 
            width: "100%", 
            maxWidth: "100%", 
            boxSizing: "border-box",
            overflow: "hidden", // Prevent overflow
          }}
        >
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Calendar" />
            <Tab label="Bookings" />
          </Tabs>
          <Box 
            sx={{ 
              p: 3, 
              width: "100%", 
              maxWidth: "100%", 
              boxSizing: "border-box",
              overflow: "hidden", // Prevent overflow
            }}
          >
            <TabPanel value={tab} index={0}>
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3, 
                  mb: 3, 
                  width: "100%", 
                  maxWidth: "100%", 
                  boxSizing: "border-box",
                  overflow: "hidden", // Prevent overflow
                }} 
                component="form" 
                onSubmit={handleSubmit}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" },
                    gap: 2,
                    width: "100%",
                    maxWidth: "100%",
                  }}
                >
                  <TextField
                    select
                    label="Product"
                    value={form.product}
                    onChange={handleChange("product")}
                    fullWidth
                    SelectProps={{ readOnly: true }}
                  >
                    <MenuItem value="Meeting Room">Meeting Room</MenuItem>
                  </TextField>
                  <TextField
                    label="Date"
                    type="date"
                    value={form.date}
                    onChange={handleChange("date")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Start Hour"
                    value={form.startHour}
                    onChange={handleChange("startHour")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  >
                    {availableTimeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="End Hour"
                    value={form.endHour}
                    onChange={handleChange("endHour")}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  >
                    {availableTimeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Attendees"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={form.attendees}
                    onChange={handleChange("attendees")}
                    fullWidth
                  />
                </Box>
                <Button sx={{ mt: 2 }} type="submit" variant="contained" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Booking"}
                </Button>
              </Paper>

              {/* Date selector for calendar view */}
              <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  label="Select date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
              </Box>

              <Availability slots={slots} rooms={rooms} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : bookings.length === 0 ? (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No bookings yet.
                  </Typography>
                </Paper>
              ) : (
                <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
                  <List disablePadding>
                    {bookings.map((booking) => (
                      <React.Fragment key={booking.id}>
                        <ListItem sx={{ py: 1.5, px: 2, gap: 2 }}>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {booking.product} - {booking.date}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {booking.startHour} - {booking.endHour} | Attendees: {booking.attendees}
                              </Typography>
                            }
                          />
                          <IconButton 
                            edge="end"
                            size="small"
                            onClick={() => handleDeleteClick(booking.id)}
                            aria-label="Delete booking"
                            sx={{ ml: "auto" }}
                          >
                            <DeleteIcon color="error" />
                          </IconButton>
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              )}
            </TabPanel>
          </Box>
        </Paper>
      </Stack>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        <DialogTitle>Booking Created Successfully</DialogTitle>
        <DialogContent>
          <Typography>
            Your booking has been created successfully!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conflict Dialog */}
      <Dialog open={conflictDialogOpen} onClose={() => setConflictDialogOpen(false)}>
        <DialogTitle>Time Slot Already Booked</DialogTitle>
        <DialogContent>
          <Typography>
            The selected time slot is already booked. Please choose a different time.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflictDialogOpen(false)} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmDialogOpen} onClose={() => {
        setDeleteConfirmDialogOpen(false);
        setBookingToDelete(null);
      }}>
        <DialogTitle>Delete Booking</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this booking? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteConfirmDialogOpen(false);
            setBookingToDelete(null);
          }} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Success Dialog */}
      <Dialog open={deleteSuccessDialogOpen} onClose={() => setDeleteSuccessDialogOpen(false)}>
        <DialogTitle>Booking Deleted Successfully</DialogTitle>
        <DialogContent>
          <Typography>
            The booking has been deleted successfully.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSuccessDialogOpen(false)} variant="contained" color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
