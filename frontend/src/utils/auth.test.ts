/**
 * Tests for the validation functions (TEST_PLAN V1-V7).
 * These just check that validateRegister and validateLogin
 * return the right error message, or null when the input is ok.
 */
import { describe, it, expect } from "vitest";
import { validateRegister, validateLogin } from "./auth";

describe("validateRegister", () => {
    it("rejects a password shorter than 6 characters", () => { // TEST_PLAN V1
        const result = validateRegister("Jo", "jose@x.com", "123");
        expect(result).toBe("Password must be at least 6 characters");
    });

    it("returns null when all fields are valid", ()=>{ // TEST_PLAN V2
        const result = validateRegister("Jo", "jose@x.com", "secret123");
        expect(result).toBeNull();
    });

    it("rejects an empty name", () => { // TEST_PLAN V3
        const result = validateRegister("", "jose@x.com", "secret123");
        expect(result).toBe("Name is required");
    });

    it("rejects an email without @", () => { // TEST_PLAN V4
        const result = validateRegister("Jo", "josex.com", "secret123");
        expect(result).toBe("Invalid email address");
    });
});

describe("validateLogin", () => {
    it("rejects an email without @", () => { // TEST_PLAN V5
        const result = validateLogin("josex.com", "secret123");
        expect(result).toBe("Invalid email address");
    });

    it("rejects an empty password", () => { // TEST_PLAN V6
        const result = validateLogin("jose@x.com", "");
        expect(result).toBe("Password is required");
    });

    it("returns null when credential are valid", () => { // TEST_PLAN V7
        const result = validateLogin("jose@x.com", "secret123");
        expect(result).toBeNull();
    });
});