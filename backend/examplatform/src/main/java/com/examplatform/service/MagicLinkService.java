package com.examplatform.service;

import com.examplatform.model.User;
import com.examplatform.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class MagicLinkService {

    private static final String PURPOSE_REGISTER = "REGISTER";
    private static final String PURPOSE_LOGIN = "LOGIN";

    private final UserService userService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final Key magicLinkSigningKey;
    private final String verifyUrlBase;
    private final Duration tokenTtl;

    private final ConcurrentMap<String, PendingLink> pendingLinks = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Instant> consumedTokenIds = new ConcurrentHashMap<>();

    public MagicLinkService(UserService userService,
                            EmailService emailService,
                            JwtUtil jwtUtil,
                            @Value("${JWT_SECRET:}") String jwtSecret,
                            @Value("${app.magic-link.verify-url:http://localhost:5173/auth/verify}") String verifyUrlBase,
                            @Value("${app.magic-link.expiry-minutes:10}") int expiryMinutes) {
        this.userService = userService;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.magicLinkSigningKey = buildSigningKey(jwtSecret);
        this.verifyUrlBase = sanitizeUrl(verifyUrlBase);
        this.tokenTtl = Duration.ofMinutes(Math.max(5, Math.min(10, expiryMinutes)));
    }

    public void sendRegisterLink(String email, String username, String password, String role) {
        cleanupExpiredState();

        String normalizedEmail = normalizeEmail(email);
        String normalizedUsername = sanitize(username);
        String normalizedPassword = password == null ? "" : password.trim();
        String normalizedRole = normalizeRole(role);

        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (normalizedUsername.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }
        if (normalizedPassword.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (userService.findByEmail(normalizedEmail) != null) {
            throw new IllegalStateException("Email already registered");
        }

        String tokenId = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(tokenTtl);
        PendingLink pending = PendingLink.forRegister(tokenId, normalizedEmail, normalizedRole, normalizedUsername, normalizedPassword, expiresAt);

        issueAndSendLink(pending);
    }

    public void sendLoginLink(String email, String password, String role) {
        cleanupExpiredState();

        String normalizedEmail = normalizeEmail(email);
        String normalizedPassword = password == null ? "" : password.trim();

        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (normalizedPassword.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (userService.isGoogleOnlyAccount(normalizedEmail)) {
            throw new IllegalStateException("Please login using Google");
        }

        User authenticatedUser = userService.login(normalizedEmail, normalizedPassword);
        String resolvedRole = normalizeRole(authenticatedUser.getRole());
        String requestedRole = role == null ? "" : role.trim().toUpperCase();

        if (!requestedRole.isBlank() && !resolvedRole.equals(requestedRole)) {
            throw new IllegalStateException("Invalid role for this login portal");
        }

        String tokenId = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(tokenTtl);
        PendingLink pending = PendingLink.forLogin(tokenId, normalizedEmail, resolvedRole, authenticatedUser.getId(), expiresAt);

        issueAndSendLink(pending);
    }

    public MagicLinkAuthResult verifyLink(String token) {
        cleanupExpiredState();

        String trimmedToken = token == null ? "" : token.trim();
        if (trimmedToken.isBlank()) {
            throw new IllegalArgumentException("Verification token is required");
        }

        Claims claims;
        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(magicLinkSigningKey)
                    .build()
                    .parseClaimsJws(trimmedToken)
                    .getBody();
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid or expired verification link");
        }

        String tokenId = sanitize(claims.getId());
        String claimEmail = normalizeEmail(String.valueOf(claims.get("email") == null ? "" : claims.get("email")));
        String claimRole = normalizeRole(String.valueOf(claims.get("role") == null ? "" : claims.get("role")));
        String claimPurpose = normalizePurpose(String.valueOf(claims.get("purpose") == null ? "" : claims.get("purpose")));

        if (tokenId.isBlank()) {
            throw new IllegalStateException("Invalid verification link");
        }

        Instant alreadyUsedExpiry = consumedTokenIds.get(tokenId);
        if (alreadyUsedExpiry != null && Instant.now().isBefore(alreadyUsedExpiry)) {
            throw new IllegalStateException("This verification link has already been used");
        }

        PendingLink pending = pendingLinks.remove(tokenId);
        if (pending == null || Instant.now().isAfter(pending.expiresAt())) {
            throw new IllegalStateException("Invalid or expired verification link");
        }

        if (!pending.email().equals(claimEmail)
                || !pending.role().equals(claimRole)
                || !pending.purpose().equals(claimPurpose)) {
            throw new IllegalStateException("Invalid verification link");
        }

        consumedTokenIds.put(tokenId, pending.expiresAt());

        User user;
        if (PURPOSE_REGISTER.equals(claimPurpose)) {
            if (userService.findByEmail(pending.email()) != null) {
                throw new IllegalStateException("Email already registered");
            }

            User toCreate = new User();
            toCreate.setUsername(pending.username());
            toCreate.setEmail(pending.email());
            toCreate.setPassword(pending.password());
            toCreate.setRole(pending.role());

            user = userService.register(toCreate);
        } else {
            user = userService.findById(pending.userId());
            if (user == null) {
                throw new IllegalStateException("User account not found");
            }

            String currentRole = normalizeRole(user.getRole());
            if (!currentRole.equals(pending.role())) {
                throw new IllegalStateException("Invalid role for this login portal");
            }
        }

        String authToken = jwtUtil.generateToken(user.getId());
        return new MagicLinkAuthResult(user, authToken);
    }

    private void issueAndSendLink(PendingLink pending) {
        pendingLinks.put(pending.tokenId(), pending);

        String token = Jwts.builder()
                .setId(pending.tokenId())
                .setSubject(pending.email())
                .claim("email", pending.email())
                .claim("role", pending.role())
                .claim("purpose", pending.purpose())
                .setIssuedAt(new Date())
                .setExpiration(Date.from(pending.expiresAt()))
                .signWith(magicLinkSigningKey, SignatureAlgorithm.HS256)
                .compact();

        try {
            emailService.sendMagicLink(pending.email(), pending.purpose(), buildVerificationUrl(token));
        } catch (Exception ex) {
            pendingLinks.remove(pending.tokenId());
            throw ex;
        }
    }

    private String buildVerificationUrl(String token) {
        String joiner = verifyUrlBase.contains("?") ? "&" : "?";
        return verifyUrlBase + joiner + "token=" + token;
    }

    private void cleanupExpiredState() {
        Instant now = Instant.now();

        pendingLinks.entrySet().removeIf(entry -> now.isAfter(entry.getValue().expiresAt()));
        consumedTokenIds.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }

    private Key buildSigningKey(String configuredSecret) {
        String resolvedSecret = configuredSecret;
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

        return Keys.hmacShaKeyFor(keyBytes);
    }

    private String sanitize(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeEmail(String email) {
        return sanitize(email).toLowerCase();
    }

    private String normalizeRole(String role) {
        return "TEACHER".equalsIgnoreCase(sanitize(role)) ? "TEACHER" : "STUDENT";
    }

    private String normalizePurpose(String purpose) {
        String normalized = sanitize(purpose).toUpperCase();
        if (PURPOSE_REGISTER.equals(normalized)) {
            return PURPOSE_REGISTER;
        }
        if (PURPOSE_LOGIN.equals(normalized)) {
            return PURPOSE_LOGIN;
        }
        throw new IllegalStateException("Invalid verification purpose");
    }

    private String sanitizeUrl(String url) {
        String normalized = sanitize(url);
        if (normalized.isBlank()) {
            return "http://localhost:5173/auth/verify";
        }
        return normalized;
    }

    public record MagicLinkAuthResult(User user, String authToken) {}

    private record PendingLink(
            String tokenId,
            String purpose,
            String email,
            String role,
            String username,
            String password,
            String userId,
            Instant expiresAt
    ) {
        static PendingLink forRegister(String tokenId, String email, String role, String username, String password, Instant expiresAt) {
            return new PendingLink(tokenId, PURPOSE_REGISTER, email, role, username, password, null, expiresAt);
        }

        static PendingLink forLogin(String tokenId, String email, String role, String userId, Instant expiresAt) {
            return new PendingLink(tokenId, PURPOSE_LOGIN, email, role, null, null, userId, expiresAt);
        }
    }
}
