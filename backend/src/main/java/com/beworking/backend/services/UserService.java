package com.beworking.backend.services;

import com.beworking.backend.dto.ProfileUpdateRequest;
import com.beworking.backend.dto.UserResponse;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder; // It holds the Authentication object is authenticated
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import static org.springframework.http.HttpStatus.NOT_FOUND;

// Service class to handle user-related operations

@Service // Indicates that this class is a service component in Spring
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        return new UserResponse(
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
        );
    }
    public UserResponse updateProfile(User user, ProfileUpdateRequest request) {
        // This will update the user profile
        user.setName(request.name());
        user.setPhone(request.phone());
        user.setCompany(request.company());
        user.setBillingAddress(request.billingAddress());
        user.setBillingCity(request.billingCity());
        user.setBillingCountry(request.billingCountry());
        user.setBillingPostalCode(request.billingPostalCode());

        // Save the updated user
        User updatedUser = userRepository.save(user);

        // Return the updated user profile
        return new UserResponse(
            updatedUser.getId(), 
            updatedUser.getName(), 
            updatedUser.getEmail(),
            updatedUser.getPhone(),
            updatedUser.getCompany(),
            updatedUser.getBillingAddress(),
            updatedUser.getBillingCity(),
            updatedUser.getBillingCountry(),
            updatedUser.getBillingPostalCode(),
            updatedUser.getSubscriptionStatus()
        );
    }


    // Method to retrieve the currently authenticated user
    // It fetches the user details from the security context and retrieves the user from the repository
    // If the user is not found, it throws a 404 Not Found exception

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal(); //
        String email;
        if (principal instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String s) {
            email = s;
        } else {
            throw new ResponseStatusException(NOT_FOUND, "User not found");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException( NOT_FOUND, "User not found"));
    }

}
