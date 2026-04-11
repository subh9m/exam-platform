package com.examplatform.controller;

import com.examplatform.dto.auth.AuthUserDto;
import com.examplatform.model.User;
import com.examplatform.security.JwtUtil;
import com.examplatform.service.MagicLinkService;
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
    private final MagicLinkService magicLinkService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, MagicLinkService magicLinkService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.magicLinkService = magicLinkService;
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
    // 1) REGISTER STEP 1: SEND MAGIC LINK
    // ---------------------------------------------------
    @PostMapping("/send-link/register")
    public ResponseEntity<?> sendRegisterLink(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String username = body.get("username");
        String password = body.get("password");
        String role = body.getOrDefault("role", "STUDENT");

        try {
            magicLinkService.sendRegisterLink(email, username, password, role);
            return ResponseEntity.ok(Map.of("message", "Verification link sent to your email"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            int status = resolveStatus(ex.getMessage());
            return ResponseEntity.status(status).body(Map.of("message", ex.getMessage()));
        }
    }

    // ---------------------------------------------------
    // 2) LOGIN STEP 1: SEND MAGIC LINK
    // ---------------------------------------------------
    @PostMapping("/send-link/login")
    public ResponseEntity<?> sendLoginLink(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String requestedRole = body.get("role");

        try {
            magicLinkService.sendLoginLink(email, password, requestedRole);
            return ResponseEntity.ok(Map.of("message", "Verification link sent to your email"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            int status = resolveStatus(ex.getMessage());
            return ResponseEntity.status(status).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            String message = ex.getMessage();
            if (message == null || message.isBlank()) {
                message = "Invalid email or password";
            }
            return ResponseEntity.status(400).body(Map.of("message", message));
        }
    }

    // ---------------------------------------------------
    // 3) VERIFY MAGIC LINK AND RETURN AUTH SESSION
    // ---------------------------------------------------
    @GetMapping("/verify")
    public ResponseEntity<?> verifyMagicLink(@RequestParam("token") String token) {
        try {
            MagicLinkService.MagicLinkAuthResult result = magicLinkService.verifyLink(token);
            return ResponseEntity.ok(Map.of(
                    "user", AuthUserDto.from(result.user()),
                    "token", result.authToken()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            int status = resolveStatus(ex.getMessage());
            return ResponseEntity.status(status).body(Map.of("message", ex.getMessage()));
        }
    }

    private int resolveStatus(String message) {
        String normalized = message == null ? "" : message.toLowerCase();
        if (normalized.contains("google") || normalized.contains("invalid role")) {
            return 403;
        }
        if (normalized.contains("invalid") || normalized.contains("expired") || normalized.contains("already")) {
            return 400;
        }
        return 503;
    }
}
