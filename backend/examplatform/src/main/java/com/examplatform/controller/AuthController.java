package com.examplatform.controller;

import com.examplatform.dto.auth.AuthUserDto;
import com.examplatform.model.User;
import com.examplatform.security.JwtUtil;
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
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
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
    // 1) REGISTER (PASSWORD-ONLY, NO SECOND FACTOR)
    // ---------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String username = body.get("username");
        String password = body.get("password");
        String role = body.getOrDefault("role", "STUDENT");

        try {
            if (email == null || email.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("message", "Email is required"));
            }
            if (username == null || username.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("message", "Username is required"));
            }
            if (password == null || password.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("message", "Password is required"));
            }

            if (userService.findByEmail(email) != null) {
                return ResponseEntity.status(400).body(Map.of("message", "Email already registered"));
            }

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);
            user.setRole(role == null || role.isBlank() ? "STUDENT" : role.trim().toUpperCase());

            User saved = userService.register(user);
            String token = jwtUtil.generateToken(saved.getId());

            return ResponseEntity.ok(Map.of("user", AuthUserDto.from(saved), "token", token));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage() == null ? "Registration failed" : ex.getMessage()));
        }
    }

    // ---------------------------------------------------
    // 2) LOGIN (PASSWORD-ONLY, NO SECOND FACTOR)
    // ---------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String requestedRole = body.get("role");

        if (userService.isGoogleOnlyAccount(email)) {
            return ResponseEntity.status(403).body(Map.of("message", "Please login using Google"));
        }

        try {
            User authenticatedUser = userService.login(email, password);

            if (requestedRole != null && !requestedRole.isBlank()) {
                String normalized = requestedRole.trim().toUpperCase();
                if (authenticatedUser.getRole() == null || !normalized.equalsIgnoreCase(authenticatedUser.getRole())) {
                    return ResponseEntity.status(403).body(Map.of("message", "Invalid role for this login portal"));
                }
            }

            String token = jwtUtil.generateToken(authenticatedUser.getId());
            return ResponseEntity.ok(Map.of("user", AuthUserDto.from(authenticatedUser), "token", token));
        } catch (RuntimeException ex) {
            String message = ex.getMessage();
            if (message == null || message.isBlank()) {
                message = "Invalid email or password";
            }
            int status = "Please login using Google".equalsIgnoreCase(message) ? 403 : 400;
            return ResponseEntity.status(status).body(Map.of("message", message));
        }
    }
}
