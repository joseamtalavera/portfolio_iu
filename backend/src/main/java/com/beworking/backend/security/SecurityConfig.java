package com.beworking.backend.security;

import com.beworking.backend.repositories.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletResponse;

import java.util.List;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/**
 * Spring Security configuration for JWT authentication and CORS.
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserRepository userRepository;

    /**
     * Creates the configuration with required dependencies.
     *
     * @param jwtAuthenticationFilter JWT auth filter
     * @param userRepository user repository
     */
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, UserRepository userRepository) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userRepository = userRepository;
    }

    /**
     * Configures the HTTP security filter chain.
     *
     * @param http HTTP security builder
     * @return configured security filter chain
     * @throws Exception when configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Enable CORS so the separate Next.js frontend (localhost:3000) may call this API.
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // CSRF disabled: safe here because auth is a stateless JWT in the Authorization
                // header, not a cookie — there is no auto-attached credential for a forged request to abuse.
                .csrf(csrf -> csrf.disable())
                // sameOrigin (not disable): let this app frame its own pages (e.g. the /pdfs) while
                // blocking foreign sites from iframing us — clickjacking defense.
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                // No server-side session: identity travels in the JWT and is rebuilt per request.
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Default-deny: every request needs authentication except the explicit public allowlist below.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/auth/register", "/auth/login").permitAll() // no token exists before login
                        .requestMatchers("/error").permitAll() // let Spring render the real error status/body; otherwise the ERROR dispatch is blocked and every error becomes 403
                        .requestMatchers("/api/subscription/webhook").permitAll() // Stripe callback has no JWT; verified by signature instead
                        .requestMatchers("/pdfs/**").permitAll() // static mailbox PDFs
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex ->ex.authenticationEntryPoint(
                    (request, response, authException) -> 
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED)  // 401, not the default 403, for missing/invalid auth
                ))
                // Provider that verifies email + password at login (DB lookup + BCrypt).
                .authenticationProvider(authenticationProvider())
                // Run the JWT filter before the password-login filter so token auth is applied first on every request.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Provides a UserDetailsService backed by the user repository.
     *
     * @return user details service
     */
    @Bean
    public UserDetailsService userDetailsService() {
        // returns a lambda expression that loads user details by username (email) for authentication purposes.
        return username -> userRepository.findByEmail(username) // looks up the user by email in the db.
                .map(user -> org.springframework.security.core.userdetails.User // if found, maps to UserDetails object.
                        .withUsername(user.getEmail()) // sets the username for authentication.
                        .password(user.getPassword()) // sets the password for authentication.
                        .authorities("USER") // assigns the "USER" authority to the user.
                .build()) // builds the UserDetails object.
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "User not found"));
    }

    /**
     * Authentication provider using DAO and password encoder.
     *
     * @return configured authentication provider
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // creates and configures a DaoAuthenticationProvider for authentication.
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Password encoder for hashing user passwords.
     *
     * @return password encoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * CORS configuration for frontend origins.
     *
     * @return CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Authentication manager bean from Spring configuration.
     *
     * @param configuration authentication configuration
     * @return authentication manager
     * @throws Exception on configuration errors
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
