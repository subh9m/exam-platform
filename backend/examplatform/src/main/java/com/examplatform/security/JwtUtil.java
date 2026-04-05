package com.examplatform.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.security.Key;

@Component
public class JwtUtil {

    private final Key secretKey;

    public JwtUtil(@Value("${JWT_SECRET:}") String jwtSecret) {
        String resolvedSecret = jwtSecret;
        if (resolvedSecret == null || resolvedSecret.isBlank()) {
            resolvedSecret = System.getProperty("JWT_SECRET");
        }
        if (resolvedSecret == null || resolvedSecret.isBlank()) {
            resolvedSecret = System.getenv("JWT_SECRET");
        }

        if (resolvedSecret == null || resolvedSecret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable is required");
        }
        byte[] keyBytes = resolvedSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters long");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUserId(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
