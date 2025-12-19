package com.beworking.backend.services;

import com.beworking.backend.dto.*;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.UserRepository;
import com.beworking.backend.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager; // AuthenticationManager is responsible for authenticating users.
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    public AuthRegisterResponse register(AuthRegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email already exists");
        }
        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();
        User saved = userRepository.save(user);
        return new AuthRegisterResponse("User registered successfully", saved.getId());
    }

    public AuthLoginResponse login(AuthLoginRequest request) {
        try {
            authenticationManager.authenticate(
                // FLOW: Creates UsernamePasswordAuthenticationToken
                // This token is used by AuthenticationManager.authenticate()
                // AuthenticationManager uses authenticationProvider (SecurityConfig line 45)
                // Which uses BCryptPasswordEncoder (SecurityConfig line 68 → 74)
                // This is what compares plain password with hashed password    
                    new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
            User user = userRepository.findByEmail(request.email())
                    .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Invalid credentials"));
            String token = jwtUtil.generateToken(user.getEmail(), user.getId());
            return new AuthLoginResponse(token, new UserResponse(
                user.getId(), 
                user.getName(), 
                user.getEmail(), 
                user.getPhone(), 
                user.getCompany(), 
                user.getBillingAddress(), 
                user.getBillingCity(), 
                user.getBillingCountry(), 
                user.getBillingPostalCode()
            ));
        } catch (Exception ex) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }
    }
}
