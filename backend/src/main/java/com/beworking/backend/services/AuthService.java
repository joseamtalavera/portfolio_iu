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

/**
 * Authentication service for user registration and login.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager; // AuthenticationManager is responsible for authenticating users.
    private final JwtUtil jwtUtil;

    /**
     * Creates the service with required dependencies.
     *
     * @param userRepository user repository
     * @param passwordEncoder password encoder
     * @param authenticationManager authentication manager
     * @param jwtUtil JWT utility
     */
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Registers a new user if the email is not already in use.
     *
     * @param request registration payload
     * @return registration response
     * @throws ResponseStatusException when email already exists
     */
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

    /**
     * Authenticates credentials and returns a JWT and user profile summary.
     *
     * @param request login payload
     * @return login response with JWT
     * @throws ResponseStatusException when credentials are invalid
     */
    public AuthLoginResponse login(AuthLoginRequest request) {
        try {
            authenticationManager.authenticate(
                // FLOW: Creates UsernamePasswordAuthenticationToken
                // This token is used by AuthenticationManager.authenticate()
                // AuthenticationManager uses authenticationProvider (SecurityConfig line 93)
                // Which uses BCryptPasswordEncoder (SecurityConfig line 107)
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
                user.getBillingPostalCode(),
                user.getSubscriptionStatus()
            ));
        } catch (Exception ex) {
            throw new ResponseStatusException(UNAUTHORIZED, "Invalid credentials");
        }
    }
}
