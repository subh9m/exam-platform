package com.examplatform.service;

import com.examplatform.model.User;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ✅ Register User (with password hashing)
    public User register(User user) {

        user.setEmail(normalizeEmail(user.getEmail()));
        user.setAuthProvider("EMAIL");

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("STUDENT");
        }

        // Prevent duplicate email
        if (userRepository.findByEmailIgnoreCase(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        // ✅ Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // ✅ Login User (check email + encrypted password)
    public User login(String email, String rawPassword) {

        email = normalizeEmail(email);

        if (email.isBlank() || rawPassword == null || rawPassword.isBlank()) {
            throw new RuntimeException("Invalid email or password");
        }

        List<User> users = userRepository.findAllByEmailIgnoreCase(email);
        if (users == null || users.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        boolean hasGoogleOnlyAccount = false;

        for (User user : users) {
            String storedPassword = user.getPassword();
            if (storedPassword == null || storedPassword.isBlank()) {
                if ("GOOGLE".equalsIgnoreCase(String.valueOf(user.getAuthProvider()))) {
                    hasGoogleOnlyAccount = true;
                }
                continue;
            }

            // ✅ Match raw password with encoded password
            if (matchesEncoded(rawPassword, storedPassword)) {
                return user;
            }

            // Backward-compatible fallback for old local records saved as plaintext passwords.
            if (rawPassword.equals(storedPassword)) {
                user.setPassword(passwordEncoder.encode(rawPassword));
                return userRepository.save(user);
            }
        }

        if (hasGoogleOnlyAccount) {
            throw new RuntimeException("This account uses Google sign-in. Please continue with Google.");
        }

        throw new RuntimeException("Invalid email or password");
    }

    public User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email));
    }

    public User findById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findOrCreateGoogleUser(String email, String displayName, String googleId) {
        return findOrCreateGoogleUser(email, displayName, googleId, "STUDENT");
    }

    public User findOrCreateGoogleUser(String email, String displayName, String googleId, String requestedRole) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedGoogleId = googleId == null ? "" : googleId.trim();
        String normalizedRequestedRole = normalizeRequestedRole(requestedRole);

        if (normalizedEmail.isBlank()) {
            throw new RuntimeException("Google account email is unavailable");
        }
        if (normalizedGoogleId.isBlank()) {
            throw new RuntimeException("Google account identifier is unavailable");
        }

        User linkedByGoogle = userRepository.findByGoogleId(normalizedGoogleId);
        if (linkedByGoogle != null) {
            boolean changed = false;
            if ((linkedByGoogle.getEmail() == null || linkedByGoogle.getEmail().isBlank())
                    || !normalizedEmail.equalsIgnoreCase(linkedByGoogle.getEmail())) {
                linkedByGoogle.setEmail(normalizedEmail);
                changed = true;
            }
            if ((linkedByGoogle.getUsername() == null || linkedByGoogle.getUsername().isBlank())
                    && displayName != null && !displayName.isBlank()) {
                linkedByGoogle.setUsername(displayName.trim());
                changed = true;
            }
            String existingRole = normalizeExistingRole(linkedByGoogle.getRole());
            if (existingRole.isBlank()) {
                linkedByGoogle.setRole(normalizedRequestedRole);
                changed = true;
            } else if (!existingRole.equals(normalizedRequestedRole)) {
                throw new RuntimeException("Invalid role for this login portal");
            }
            if (!"GOOGLE".equalsIgnoreCase(linkedByGoogle.getAuthProvider())) {
                linkedByGoogle.setAuthProvider("GOOGLE");
                changed = true;
            }
            if (!linkedByGoogle.isVerified()) {
                linkedByGoogle.setVerified(true);
                changed = true;
            }
            return changed ? userRepository.save(linkedByGoogle) : linkedByGoogle;
        }

        User existingByEmail = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingByEmail != null) {
            String existingRole = normalizeExistingRole(existingByEmail.getRole());
            if (!existingRole.isBlank() && !existingRole.equals(normalizedRequestedRole)) {
                throw new RuntimeException("Invalid role for this login portal");
            }

            existingByEmail.setGoogleId(normalizedGoogleId);
            if ((existingByEmail.getUsername() == null || existingByEmail.getUsername().isBlank())
                    && displayName != null && !displayName.isBlank()) {
                existingByEmail.setUsername(displayName.trim());
            }
            if (existingByEmail.getRole() == null || existingByEmail.getRole().isBlank()) {
                existingByEmail.setRole(normalizedRequestedRole);
            }
            existingByEmail.setVerified(true);
            if (existingByEmail.getAuthProvider() == null || existingByEmail.getAuthProvider().isBlank()) {
                existingByEmail.setAuthProvider("GOOGLE");
            }
            return userRepository.save(existingByEmail);
        }

        User created = new User();
        created.setEmail(normalizedEmail);
        created.setGoogleId(normalizedGoogleId);
        created.setAuthProvider("GOOGLE");
        created.setRole(normalizedRequestedRole);
        created.setVerified(true);
        created.setPassword(null);
        created.setUsername((displayName == null || displayName.isBlank())
                ? normalizedEmail.split("@")[0]
                : displayName.trim());
        return userRepository.save(created);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeRequestedRole(String role) {
        String normalized = role == null ? "" : role.trim().toUpperCase();
        return "TEACHER".equals(normalized) ? "TEACHER" : "STUDENT";
    }

    private String normalizeExistingRole(String role) {
        String normalized = role == null ? "" : role.trim().toUpperCase();
        if (normalized.isBlank()) {
            return "";
        }
        return "TEACHER".equals(normalized) ? "TEACHER" : "STUDENT";
    }

    private boolean matchesEncoded(String rawPassword, String encodedPassword) {
        try {
            return passwordEncoder.matches(rawPassword, encodedPassword);
        } catch (IllegalArgumentException ex) {
            // Ignore malformed legacy password payloads and allow fallback checks.
            return false;
        }
    }
}
