/**
 * Tests for the register form on the landing page (TEST_PLAN F1).
 * F1: a password shorter than 6 chars shows an error and does not submit.
 */
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/theme";
import Home from "./page";
import { registerUser } from "@/utils/auth";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/FrontLayout", () => ({
    FrontLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/utils/auth", async (importOriginal) => {
    // Keep the real module but swap registerUser for a fake we can control
    const actual = await importOriginal<typeof import("@/utils/auth")>();
    return {
        ...actual, // validateRegister stays real, so F1 still works
        registerUser: vi.fn(),
    };
});

describe("Register form", () => {
    it("shows an error when the password is too short", async () => { // TEST_PLAN F1
        // No registerUser mock needed: validateRegister blocks a short password
        // before any request is sent, so the error shows without hitting the API.
        const user = userEvent.setup();
        render(
            <ThemeProvider theme={theme}>
                <Home />
            </ThemeProvider>
        );

        await user.type(screen.getByPlaceholderText("Full Name"), "Jose");
        await user.type(screen.getByPlaceholderText("Email Address"), "jose@x.com");
        await user.type(screen.getByPlaceholderText("Password"), "123");
        await user.click(screen.getByRole("button", { name: "REQUEST YOUR VIRTUAL OFFICE" }));

        expect(await screen.findByText("Password must be at least 6 characters")).toBeInTheDocument();
    });

    it("sends the register request when the details are valid", async () => { // TEST_PLAN F2
        // Force the register call to succeed
        vi.mocked(registerUser).mockResolvedValueOnce({});
        const user = userEvent.setup();
        render(
            <ThemeProvider theme={theme}>
                <Home />
            </ThemeProvider>
        );

        await user.type(screen.getByPlaceholderText("Full Name"), "Jose");
        await user.type(screen.getByPlaceholderText("Email Address"), "jose@x.com");
        await user.type(screen.getByPlaceholderText("Password"), "secret123");
        await user.click(screen.getByRole("button", { name: "REQUEST YOUR VIRTUAL OFFICE"}));

        expect(registerUser).toHaveBeenCalledWith("Jose", "jose@x.com", "secret123");
    });
});
