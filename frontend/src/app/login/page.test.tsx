/**
 * Component tests for the login page (TEST_PLAN F3, F4).
 * F3: a rejected server login renders the "Invalid credentials" error.
 * F4: valid credentials send the login request.
 * Mocks: next router, FrontLayout, and loginUser.
 */
import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/theme";
import { loginUser } from "@/utils/auth";
import Login from "./page";

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/FrontLayout", () => ({
    FrontLayout: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/utils/auth", async (importOriginal) => {
    // Keep the real module, but swap loginUser for a fake we can control.
    const actual = await importOriginal<typeof import("@/utils/auth")>();
    return {
        ...actual,          // all the real functions (validateLogin stays real)
        loginUser: vi.fn(), // this one becomes an empty, controllable spy
    };
});

describe("Login page", () => {
    it("shows 'Invalid credentials' when login fails", async () => { // TEST_PLAN F3
        // Force this login attempt to fail, as a wrong password would.
        vi.mocked(loginUser).mockRejectedValueOnce(new Error("Invalid credentials"));
        const user = userEvent.setup();
        render(
            <ThemeProvider theme={theme}>
                <Login />
            </ThemeProvider>
        );

        await user.type(screen.getByPlaceholderText("Email Address"), "jose@x.com");
        await user.type(screen.getByPlaceholderText("Password"), "secret123");
        await user.click(screen.getByRole("button", { name: "Login" }));

        expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    });

    it("sends the login request when credentials are valid", async () => { // TEST_PLAN F4
        // Force this login attempt to succeed, returning a dummy token.
        vi.mocked(loginUser).mockResolvedValueOnce({ token: "fake.jwt", user: undefined });
        const user = userEvent.setup();
        render(
            <ThemeProvider theme={theme}>
                <Login />
            </ThemeProvider>
        );

        await user.type(screen.getByPlaceholderText("Email Address"), "jose@x.com");
        await user.type(screen.getByPlaceholderText("Password"), "secret123");
        await user.click(screen.getByRole("button", { name: "Login" }));

        // The spy recorded the call, so we can check it ran with the typed credentials.
        expect(loginUser).toHaveBeenCalledWith("jose@x.com", "secret123");
    });
});
