package com.beworking.backend.controllers;

import com.beworking.backend.dto.ProfileUpdateRequest;
import com.beworking.backend.dto.UserResponse;
import com.beworking.backend.entities.User;
import com.beworking.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse me() {
        return userService.getCurrentUserProfile();
    }

    // this will update the user profile
    @PutMapping("/profile")
    public UserResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        
        // Get the current user that is authenticated
        User user = userService.getCurrentUser();
        // Update the user profile
        return userService.updateProfile(user, request);
    }

}
