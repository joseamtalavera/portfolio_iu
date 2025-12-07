package com.beworking.backend.security;

import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

// JwtAuthenticationFilter is a custom filter that intercepts incoming HTTP requests to validate JWT tokens and 
// set the authentication context.

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter { // OncePerRequestFilter ensures that the filter is executed only once per request.

    private final JwtUtil jwtUtil; 
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // The doFilterInternal method is overridden to implement the custom filtering logic.
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION); // getHeader is defined in HttpServletRequest interface to retrieve the value of the specified request header as a String.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // If no Authorization header or it doesn't start with "Bearer ", continue the filter chain without authentication.
            return;
        }

        String token = authHeader.substring(7); // Extract the JWT token by removing the "Bearer " prefix. beginIndex is 7 because "Bearer " has 7 characters.
        String username = jwtUtil.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) { // Check if username is extracted and no authentication is set in the security context.
            User user = userRepository.findByEmail(username).orElse(null);
            if (user != null && jwtUtil.isTokenValid(token, username)) {
                UserDetails userDetails = org.springframework.security.core.userdetails.User
                        .withUsername(user.getEmail())
                        .password(user.getPassword())
                        .authorities(Collections.emptyList())
                        .build();

                UsernamePasswordAuthenticationToken authenticationToken = // Create an authentication token using the user details and authorities.
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()); // The second parameter is null because credentials are not needed after successful authentication.
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request)); // Set additional details about the authentication request, such as the remote address and session ID.
                SecurityContextHolder.getContext().setAuthentication(authenticationToken); // Set the authentication token in the security context, marking the user as authenticated for the current request.
            }
        }
        filterChain.doFilter(request, response);
    }
}
