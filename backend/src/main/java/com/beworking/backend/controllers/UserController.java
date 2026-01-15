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

/**
 * User profile endpoints for the authenticated user.
 */
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    private final UserService userService;

    /**
     * Creates the controller with required user service.
     *
     * @param userService user service
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Returns the current authenticated user profile.
     *
     * @return current user profile
     */
    @GetMapping("/me")
    public UserResponse me() {
        return userService.getCurrentUserProfile();
    }

    /**
     * Updates the current user profile.
     *
     * @param request profile update payload
     * @return updated user profile
     */
    @PutMapping("/profile")
    public UserResponse updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        
        // Get the current user that is authenticated
        User user = userService.getCurrentUser();
        // Update the user profile
        return userService.updateProfile(user, request);
    }

}
