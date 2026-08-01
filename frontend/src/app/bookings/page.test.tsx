/**
 * Test for the bookings page (TEST_PLAN F6).
 * F6: picking a slot that overlaps an existing booking opens the
 * "already booked" dialog, before any create request is sent.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/theme";
import BookingsPage from "./page";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/components/dashboard-layout", () => ({
    DashboardLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/availability", () => ({
    Availability: () => null,
}));

// An existing booking we will deliberately overlap: 10:30-11:30
const existingBooking = {
    id:1,
    product: "Meeting Room",
    date: "2030-01-01",
    startHour: "10:30",
    endHour: "11:30",
    attendees: 1,
};

beforeEach(() => { 
    localStorage.setItem("jwt", "fake.jwt");
    // the page loads bookings on mount; return the one we want to clash with.
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
        ok:true,
        json: async () => [existingBooking],
    }));
});

describe("Booking page", () => {
    it("opens the 'already booked' dialog for an overlapping slot", async () => { // TEST_PLAN F6
        const user = userEvent.setup();
        render(
            <ThemeProvider theme={theme}>
                <BookingsPage />
            </ThemeProvider>
        );

        // The form only appears once the page has loaded (ready === true)
        const dateField = await screen.findByLabelText("Date");
        await user.type(dateField, "2030-01-01");

        // Choose 10:00-11:30, which overlaps the existing 10:30-11:30
        await user.click(screen.getByLabelText("Start Hour"));
        await user.click(await screen.findByRole("option", { name: "10:00"}));
        await user.click(screen.getByLabelText("End Hour"));
        await user.click(await screen.findByRole("option", { name: "11:30"}));

        await user.click(screen.getByRole("button", { name: "Create Booking"}));

        expect(await screen.findByText("Time Slot Already Booked")).toBeInTheDocument();
    });
});