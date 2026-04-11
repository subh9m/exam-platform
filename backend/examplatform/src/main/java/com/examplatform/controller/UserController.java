package com.examplatform.controller;

import com.examplatform.service.AccountService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final AccountService accountService;

    public UserController(AccountService accountService) {
        this.accountService = accountService;
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String userId = String.valueOf(authentication.getPrincipal());
        try {
            accountService.deleteAccountByUserId(userId);
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("message", "Unable to delete account right now"));
        }
    }
}
