package com.examplatform.controller;

import com.examplatform.dto.auth.AuthUserDto;
import com.examplatform.model.User;
import com.examplatform.security.JwtUtil;
import com.examplatform.service.OtpService;
import com.examplatform.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String OAUTH_ROLE_COOKIE = "oauth_portal_role";

    private final UserService userService;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, OtpService otpService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.otpService = otpService;
        this.jwtUtil = jwtUtil;
    }

    // ---------------------------------------------------
    // -1) OAUTH START: STORE PORTAL ROLE + REDIRECT
    // ---------------------------------------------------
    @GetMapping("/oauth/start")
    public void startOauth(@RequestParam(name = "role", required = false) String role,
                           HttpServletRequest request,
                           HttpServletResponse response) throws IOException {
        String normalizedRole = "TEACHER".equalsIgnoreCase(role) ? "TEACHER" : "STUDENT";

        Cookie cookie = new Cookie(OAUTH_ROLE_COOKIE, normalizedRole);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(300);
        cookie.setSecure(request.isSecure());
        response.addCookie(cookie);

        response.sendRedirect("/oauth2/authorization/google");
    }

    // ---------------------------------------------------
    // 0) OAUTH LOGIN VALIDATION: VERIFY TOKEN + ROLE
    // ---------------------------------------------------
    @PostMapping("/oauth-login")
    public ResponseEntity<?> oauthLogin(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String requestedRole = body.get("role");

        if (token == null || token.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("message", "OAuth token is required"));
        }

        final String userId;
        try {
            userId = jwtUtil.extractUserId(token);
        } catch (Exception ex) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid or expired OAuth token"));
        }

        User user = userService.findById(userId);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid OAuth session"));
        }

        if (requestedRole != null && !requestedRole.isBlank()) {
            String normalized = requestedRole.trim().toUpperCase();
            String userRole = user.getRole() == null ? "" : user.getRole().trim().toUpperCase();
            if (!normalized.equals(userRole)) {
                return ResponseEntity.status(403).body(Map.of("message", "Invalid role for this login portal"));
            }
        }

        return ResponseEntity.ok(Map.of("user", AuthUserDto.from(user), "token", token));
    }

    // ---------------------------------------------------
    // 1) REGISTER STEP 1: SEND OTP
    // ---------------------------------------------------
    @PostMapping("/send-otp/register")
    public ResponseEntity<?> sendRegisterOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        if (userService.findByEmail(email) != null) {
            return ResponseEntity.status(400).body(Map.of("message", "Email already registered"));
        }

        try {
            otpService.issueOtp(email, "REGISTER");
            return ResponseEntity.ok("OTP generated");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            int status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("too many otp requests")
                    ? 429
                    : 503;
            return ResponseEntity.status(status).body(Map.of("message", ex.getMessage()));
        }
    }

    // ---------------------------------------------------
    // 2) REGISTER STEP 2: VERIFY OTP & CREATE ACCOUNT
    // ---------------------------------------------------
    @PostMapping("/verify-otp/register")
    public ResponseEntity<?> verifyRegisterOtp(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String username = body.get("username");
        String password = body.get("password");
        String otp = body.get("otp");
        String role = body.getOrDefault("role", "STUDENT");

        if (!otpService.verifyOtp(email, "REGISTER", otp)) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired OTP"));
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(password); // password hashing done in service
        user.setRole(role == null || role.isBlank() ? "STUDENT" : role.trim().toUpperCase());

        User saved = userService.register(user);
        String token = jwtUtil.generateToken(saved.getId());

        return ResponseEntity.ok(Map.of("user", AuthUserDto.from(saved), "token", token));
    }

    // ---------------------------------------------------
    // 3) LOGIN STEP 1: VERIFY EMAIL + PASSWORD, THEN SEND OTP
    // ---------------------------------------------------
    @PostMapping("/send-otp/login")
    public ResponseEntity<?> sendLoginOtp(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");
        String requestedRole = body.get("role");
        User authenticatedUser;

        if (userService.isGoogleOnlyAccount(email)) {
            return ResponseEntity.status(403).body(Map.of("message", "Please login using Google"));
        }

        try {
            // Check user credentials first
            authenticatedUser = userService.login(email, password);
        } catch (Exception ex) {
            String message = ex.getMessage();
            if (message == null || message.isBlank()) {
                message = "Invalid email or password";
            }
            int status = "Please login using Google".equalsIgnoreCase(message) ? 403 : 400;
            return ResponseEntity.status(status).body(Map.of("message", message));
        }

        if (requestedRole != null && !requestedRole.isBlank()) {
            String normalized = requestedRole.trim().toUpperCase();
            if (authenticatedUser.getRole() == null || !normalized.equalsIgnoreCase(authenticatedUser.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Invalid role for this login portal"));
            }
        }

        try {
            otpService.issueOtp(email, "LOGIN");
            return ResponseEntity.ok("OTP generated");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            int status = ex.getMessage() != null && ex.getMessage().toLowerCase().contains("too many otp requests")
                    ? 429
                    : 503;
            return ResponseEntity.status(status).body(Map.of("message", ex.getMessage()));
        }
    }

    // ---------------------------------------------------
    // 4) LOGIN STEP 2: VERIFY OTP & ISSUE TOKEN
    // ---------------------------------------------------
    @PostMapping("/verify-otp/login")
    public ResponseEntity<?> verifyLoginOtp(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String otp = body.get("otp");
        String requestedRole = body.get("role");

        if (userService.isGoogleOnlyAccount(email)) {
            return ResponseEntity.status(403).body(Map.of("message", "Please login using Google"));
        }

        if (!otpService.verifyOtp(email, "LOGIN", otp)) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired OTP"));
        }

        User user = userService.findOtpEligibleUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid email or password"));
        }
        if (requestedRole != null && !requestedRole.isBlank()) {
            String normalized = requestedRole.trim().toUpperCase();
            if (user.getRole() == null || !normalized.equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(403).body(Map.of("message", "Invalid role for this login portal"));
            }
        }
        String token = jwtUtil.generateToken(user.getId());

        return ResponseEntity.ok(Map.of("user", AuthUserDto.from(user), "token", token));
    }
}
