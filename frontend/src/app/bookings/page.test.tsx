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

vi.mock("next/navigation", () => {
    // Return the SAME router object on every call. A fresh object each render would
    // change the identity of the mount effect's [router] dependency, re-running it
    // every render — an infinite refetch loop ("Maximum update depth exceeded").
    const router = { push: vi.fn(), replace: vi.fn() };
    return { useRouter: () => router };
});

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

    it("End Hour dropdown offers only slots later than the chosen Start Hour", async () => { // TEST_PLAN F5
        const user = userEvent.setup();
        render(
            <ThemeProvider theme={theme}>
                <BookingsPage />
            </ThemeProvider>
        );

        // A date with no existing booking, so every slot is available.
        const dateField = await screen.findByLabelText("Date");
        await user.type(dateField, "2030-02-02");

        // Pick a Start Hour partway through the day.
        await user.click(screen.getByLabelText("Start Hour"));
        await user.click(await screen.findByRole("option", { name: "11:00" }));

        // Open the End Hour dropdown and inspect what it offers.
        await user.click(screen.getByLabelText("End Hour"));

        // A later slot is offered...
        expect(await screen.findByRole("option", { name: "11:30" })).toBeInTheDocument();
        // ...but the equal slot and an earlier one are not.
        expect(screen.queryByRole("option", { name: "11:00" })).not.toBeInTheDocument();
        expect(screen.queryByRole("option", { name: "10:30" })).not.toBeInTheDocument();
    });

    it("shows the server's error message in the banner when a create fails", async () => { // TEST_PLAN F7
        const user = userEvent.setup();
        // Method-aware mock: every GET returns an empty list; the POST (create) is
        // rejected with a JSON message. Order-independent, so extra GETs can't break it.
        const fetchMock = vi.fn((_url: string, options?: RequestInit) =>
            Promise.resolve(
                options?.method === "POST"
                    ? { ok: false, status: 500, json: async () => ({ message: "The booking could not be saved" }) }
                    : { ok: true, json: async () => [] }
            )
        );
        vi.stubGlobal("fetch", fetchMock);

        render(
            <ThemeProvider theme={theme}>
                <BookingsPage />
            </ThemeProvider>
        );

        // A free date, so the client conflict guard passes and the request is actually sent.
        const dateField = await screen.findByLabelText("Date");
        await user.type(dateField, "2030-03-03");

        await user.click(screen.getByLabelText("Start Hour"));
        await user.click(await screen.findByRole("option", { name: "09:00" }));
        await user.click(screen.getByLabelText("End Hour"));
        await user.click(await screen.findByRole("option", { name: "10:00" }));

        await user.click(screen.getByRole("button", { name: "Create Booking" }));

        // The banner shows the backend's message, not a generic fallback or raw JSON.
        expect(
            await screen.findByText("The booking could not be saved")
        ).toBeInTheDocument();
    });
});