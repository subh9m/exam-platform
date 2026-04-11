package com.examplatform.controller;

import com.examplatform.security.JwtUtil;
import com.examplatform.service.AccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final AccountService accountService;
    private final JwtUtil jwtUtil;

    public UserController(AccountService accountService, JwtUtil jwtUtil) {
        this.accountService = accountService;
        this.jwtUtil = jwtUtil;
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = resolveUserId(authentication, authorizationHeader);

        if (userId == null || userId.isBlank()) {
            logger.warn("Delete account unauthorized access attempt");
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        try {
            logger.info("Deleting account for userId={}", userId);
            accountService.deleteAccountByUserId(userId);
            logger.info("Account deletion successful for userId={}", userId);
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (IllegalArgumentException ex) {
            logger.warn("Delete account validation failed for userId={}: {}", userId, ex.getMessage());
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            logger.error("Delete account failed for userId={}", userId, ex);
            return ResponseEntity.status(500).body(Map.of("message", "Unable to delete account right now"));
        }
    }

    private String resolveUserId(Authentication authentication, String authorizationHeader) {
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() != null) {
            String principal = String.valueOf(authentication.getPrincipal()).trim();
            if (!principal.isBlank() && !"anonymousUser".equalsIgnoreCase(principal)) {
                return principal;
            }
        }

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7).trim();
            if (!token.isBlank()) {
                try {
                    return jwtUtil.extractUserId(token);
                } catch (Exception ex) {
                    logger.warn("Failed to extract user id from JWT for delete-account");
                }
            }
        }

        return null;
    }
}
