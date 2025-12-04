package com.beworking.backend.services;

import com.beworking.backend.dto.UserResponse;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
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
