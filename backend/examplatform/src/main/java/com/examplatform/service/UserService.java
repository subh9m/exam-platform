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
        user.setAuthProvider("LOCAL");

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

        boolean hasGoogleAccount = false;
        boolean hasLocalAccount = false;

        for (User user : users) {
            String provider = normalizeAuthProvider(user.getAuthProvider());
            if ("GOOGLE".equals(provider)) {
                hasGoogleAccount = true;
            } else {
                hasLocalAccount = true;
            }
        }

        if (hasGoogleAccount && !hasLocalAccount) {
            throw new RuntimeException("Please login using Google");
        }

        for (User user : users) {
            String provider = normalizeAuthProvider(user.getAuthProvider());
            if ("GOOGLE".equals(provider)) {
                continue;
            }

            String storedPassword = user.getPassword();
            if (storedPassword == null || storedPassword.isBlank()) {
                continue;
            }

            // ✅ Match raw password with encoded password
            if (matchesEncoded(rawPassword, storedPassword)) {
                if (!"LOCAL".equalsIgnoreCase(String.valueOf(user.getAuthProvider()))) {
                    user.setAuthProvider("LOCAL");
                    return userRepository.save(user);
                }
                return user;
            }

            // Backward-compatible fallback for old local records saved as plaintext passwords.
            if (rawPassword.equals(storedPassword)) {
                user.setPassword(passwordEncoder.encode(rawPassword));
                user.setAuthProvider("LOCAL");
                return userRepository.save(user);
            }
        }

        throw new RuntimeException("Invalid email or password");
    }

    public boolean isGoogleOnlyAccount(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) {
            return false;
        }

        List<User> users = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
        if (users == null || users.isEmpty()) {
            return false;
        }

        boolean hasGoogle = false;
        boolean hasLocal = false;

        for (User user : users) {
            String provider = normalizeAuthProvider(user.getAuthProvider());
            if ("GOOGLE".equals(provider)) {
                hasGoogle = true;
            } else {
                hasLocal = true;
            }
        }

        return hasGoogle && !hasLocal;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(normalizeEmail(email));
    }

    public User findOtpEligibleUserByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail.isBlank()) {
            return null;
        }

        List<User> users = userRepository.findAllByEmailIgnoreCase(normalizedEmail);
        if (users == null || users.isEmpty()) {
            return null;
        }

        for (User user : users) {
            if (!"GOOGLE".equals(normalizeAuthProvider(user.getAuthProvider()))) {
                return user;
            }
        }

        return users.get(0);
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

            String currentProviderRaw = linkedByGoogle.getAuthProvider();
            String normalizedProvider = normalizeAuthProvider(currentProviderRaw);
            if (currentProviderRaw == null || currentProviderRaw.isBlank()) {
                linkedByGoogle.setAuthProvider("GOOGLE");
                changed = true;
            } else if (!normalizedProvider.equalsIgnoreCase(currentProviderRaw)) {
                linkedByGoogle.setAuthProvider(normalizedProvider);
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

            String currentProviderRaw = existingByEmail.getAuthProvider();
            String normalizedProvider = normalizeAuthProvider(currentProviderRaw);
            if (currentProviderRaw == null || currentProviderRaw.isBlank()) {
                existingByEmail.setAuthProvider("LOCAL");
            } else if (!normalizedProvider.equalsIgnoreCase(currentProviderRaw)) {
                existingByEmail.setAuthProvider(normalizedProvider);
            }

            existingByEmail.setVerified(true);
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

    private String normalizeAuthProvider(String provider) {
        String normalized = provider == null ? "" : provider.trim().toUpperCase();
        if ("GOOGLE".equals(normalized)) {
            return "GOOGLE";
        }
        return "LOCAL";
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
