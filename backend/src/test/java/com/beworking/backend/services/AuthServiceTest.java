package com.beworking.backend.services;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;


import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.server.ResponseStatusException;

import com.beworking.backend.dto.AuthLoginRequest;
import com.beworking.backend.dto.AuthLoginResponse;
import com.beworking.backend.dto.AuthRegisterRequest;
import com.beworking.backend.dto.UserResponse;
import com.beworking.backend.repositories.UserRepository;
import com.beworking.backend.security.JwtUtil;
import com.beworking.backend.entities.User;

import java.util.Optional;
import java.util.Arrays;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("register rejects an email that already exists")
    void registerRejectsDuplicateEmail(){ // TEST_PLAN A1
        AuthRegisterRequest request = new AuthRegisterRequest(
            "Jose Talavera", "jose@example.com", "pass123");
        
        when(userRepository.existsByEmail("jose@example.com")).thenReturn(true);

        ResponseStatusException thrown = assertThrows(
            ResponseStatusException.class,
            () -> authService.register(request));
        
        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
        verify(userRepository, never()).save(any());    
    }

    @Test
    @DisplayName("register stores the encoded password, never the typed one")
    void registerStoresHashNeverPlaintext(){ // TEST_PLAN A2
        AuthRegisterRequest request = new AuthRegisterRequest(
            "Jose Talavera", "jose@example.com", "pass123");

        when(userRepository.existsByEmail("jose@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("HASHED");
        when(userRepository.save(any())).thenReturn(User.builder().id(1L).build());

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertEquals("HASHED", captor.getValue().getPassword());
        assertNotEquals("pass123", captor.getValue().getPassword());
    }

    @Test
    @DisplayName("login returns a non-empty token for valid credentials")
    void loginReturnsTokenForValidCredentials(){ // TEST_PLAN A3
        AuthLoginRequest request = new AuthLoginRequest("jose@example.com", "pass123");
        User user = User.builder().id(1L).email("jose@example.com").build();

        when(userRepository.findByEmail("jose@example.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("jose@example.com", 1L)).thenReturn("jwt-token");

        AuthLoginResponse response = authService.login(request);

        assertEquals("jwt-token", response.token());
    }

    @Test
    @DisplayName("login gives the same 401 and message for a wrong password and an unknown email")
    void loginRejectsWrongPasswordWithSameMessageAsUnknownEmail(){ // TEST_PLAN A4
        when(authenticationManager.authenticate(any()))
            .thenThrow(new BadCredentialsException("bad credentials"));

        ResponseStatusException wrongPassword = assertThrows(
            ResponseStatusException.class,
            () -> authService.login(new AuthLoginRequest("real@example.com", "wrongpass")));

        ResponseStatusException unknowEmail = assertThrows(
            ResponseStatusException.class,
            () -> authService.login(new AuthLoginRequest("fake@example.com", "anything")));

        assertEquals(wrongPassword.getStatusCode(), unknowEmail.getStatusCode());
        assertEquals(wrongPassword.getReason(), unknowEmail.getReason());

    }

    @Test
    @DisplayName("the login response DTO exposes no password field")
    void loginResponseNeverCarriesThePasswordField(){ // TEST_PLAN A5
        boolean hasPassword = Arrays.stream(UserResponse.class.getRecordComponents())
            .anyMatch(component -> component.getName().equals("password"));
        
        assertFalse(hasPassword);
    }

}