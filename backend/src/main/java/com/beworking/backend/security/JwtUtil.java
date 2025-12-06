package com.beworking.backend.security;

import io.jsonwebtoken.Claims; // Utility class for generating, validating, and extracting claims from JSON Web Tokens (JWTs) used in authentication.
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm; // Provides methods to create and verify JWTs using a specified signature algorithm.
import io.jsonwebtoken.io.Decoders; // Utility class for decoding Base64-encoded strings, commonly used for decoding secret keys in JWT operations.
import io.jsonwebtoken.security.Keys; // Utility class for generating cryptographic keys for signing JWTs.
import org.springframework.beans.factory.annotation.Value; // Annotation to inject values from application properties into class fields or constructor parameters.
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.function.Function; // Functional interface representing a function that takes an input and produces an output, used for extracting claims from JWTs.


/* A Jwt consists of three parts:
    1. Header: Contains metadata about the token, such as the type of token and the signing algorithm used.
    2. Payload: Contains the claims, which are statements about an entity (typically, the user) and additional data.
    3. Signature: Used to verify the authenticity of the token and ensure it hasn't been tampered with.
 */

@Component
public class JwtUtil {

    private final Key signingKey;
    private final long expirationMs;

    public JwtUtil(@Value("${jwt.secret}") String secret,
                   @Value("${jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)); // (1) Base64 is decoding into byte array. (2)Then, Keys.hmacShaKeyFor creates a "signing key" using the decoded byte array and HMAC SHA algorithm. (3) This key is stored in the signingKey variable for signing and verifying JWTs.
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email, Long userId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder() // Think of builder as a tool the create a blank template for the JWT.
                .setSubject(email)
                .addClaims(Map.of("userId", userId))
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256) // This line signs the JWT using the previously created signingKey and specifies the HMAC SHA-256 algorithm for signing. 
                .compact(); // This method finalizes the JWT creation process by compacting all the components (header, payload, and signature) into a single string representation of the JWT.
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return resolver.apply(claims);
    }
}
