package com.examplatform.controller;

import com.examplatform.dto.auth.AuthUserDto;
import com.examplatform.model.User;
import com.examplatform.security.JwtUtil;
import com.examplatform.service.OtpService;
import com.examplatform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, OtpService otpService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.otpService = otpService;
        this.jwtUtil = jwtUtil;
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

        try {
            // Check user credentials first
            userService.login(email, password);
        } catch (Exception ex) {
            String message = ex.getMessage();
            if (message == null || message.isBlank()) {
                message = "Invalid email or password";
            }
            return ResponseEntity.status(400).body(Map.of("message", message));
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

        if (!otpService.verifyOtp(email, "LOGIN", otp)) {
            return ResponseEntity.status(400).body(Map.of("message", "Invalid or expired OTP"));
        }

        User user = userService.findByEmail(email);
        if (requestedRole != null && !requestedRole.isBlank()) {
            String normalized = requestedRole.trim().toUpperCase();
            if (user.getRole() == null || !normalized.equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.status(400).body(Map.of("message", "Role mismatch"));
            }
        }
        String token = jwtUtil.generateToken(user.getId());

        return ResponseEntity.ok(Map.of("user", AuthUserDto.from(user), "token", token));
    }
}
