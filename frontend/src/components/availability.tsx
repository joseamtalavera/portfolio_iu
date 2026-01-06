"use client";

import React from "react";
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { RoomAvailability, TimeSlot } from "@/types";

type AvailabilityProps = {
  slots: TimeSlot[];
  rooms: RoomAvailability[];
};

export function Availability({ slots, rooms }: AvailabilityProps) {
  const theme = useTheme();
  const roomColWidth = 160;
  const slotWidth = 70;
  const minTableWidth = roomColWidth + slots.length * slotWidth;

  return (
    <Paper 
      sx={{ 
        p: 2, 
        borderRadius: 3, 
        width: "100%", 
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden", // Contain scrolling within Paper
      }}
    >
      <TableContainer
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          overflowY: "hidden",
          height: "fit-content",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          // Custom scrollbar styling
          "&::-webkit-scrollbar": {
            height: 10,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.brand.borderSoft,
            borderRadius: 5,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: theme.palette.brand.muted,
            borderRadius: 5,
            "&:hover": {
              backgroundColor: theme.palette.brand.dark,
            },
          },
          scrollbarWidth: "thin",
          scrollbarColor: `${theme.palette.brand.muted} ${theme.palette.brand.borderSoft}`,
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={{
            minWidth: minTableWidth,
            "& .MuiTableCell-root": {
              borderRight: "1px solid rgba(148, 163, 184, 0.12)",
              padding: 0.75,
            },
            "& .MuiTableRow-root": {
              borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                  bgcolor: "background.paper",
                  minWidth: roomColWidth,
                  maxWidth: roomColWidth,
                  borderRight: "1px solid rgba(148, 163, 184, 0.24)",
                  boxShadow: "4px 0 12px rgba(15, 23, 42, 0.06)",
                }}
              >
                Room
              </TableCell>
              {slots.map((slot) => (
                <TableCell
                  key={slot.value}
                  align="center"
                  sx={{ minWidth: slotWidth, maxWidth: slotWidth }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    {slot.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.room} hover>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    bgcolor: "background.paper",
                    minWidth: roomColWidth,
                    maxWidth: roomColWidth,
                    borderRight: "1px solid rgba(148, 163, 184, 0.24)",
                    boxShadow: "2px 0 8px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2" fontWeight="medium">
                      {room.room}
                    </Typography>
                  </Stack>
                </TableCell>
                {slots.map((slot) => {
                  const isBooked = room.booked.includes(slot.value);
                  return (
                    <TableCell
                      key={`${room.room}-${slot.value}`}
                      align="center"
                      sx={{ minWidth: slotWidth, maxWidth: slotWidth, p: 0.75 }}
                    >
                      <Box
                        sx={{
                          height: 48,
                          width: "100%",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isBooked ? theme.palette.error.light : theme.palette.brand.border,
                          bgcolor: isBooked ? theme.palette.error.light : theme.palette.brand.lightBg,
                        }}
                      >
                        {isBooked ? (
                          <Typography variant="caption" fontWeight={600} color={theme.palette.error.main} noWrap>
                            Booked
                          </Typography>
                        ) : null}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
