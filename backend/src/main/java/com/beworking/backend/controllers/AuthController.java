package com.beworking.backend.controllers;

import com.beworking.backend.dto.AuthLoginRequest;
import com.beworking.backend.dto.AuthLoginResponse;
import com.beworking.backend.dto.AuthRegisterRequest;
import com.beworking.backend.dto.AuthRegisterResponse;
import com.beworking.backend.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register") //  Handles user registration requests.
    @ResponseStatus(HttpStatus.CREATED) // Sets the HTTP status to 201 Created when a new user is registered.
    public AuthRegisterResponse register (@Valid @RequestBody AuthRegisterRequest request) {
        // Handles user registration by delegating to the AuthService.
        return authService.register(request);
    }

    @PostMapping("/login") // Handles user login requests.
    public AuthLoginResponse login (@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request);
    }
}