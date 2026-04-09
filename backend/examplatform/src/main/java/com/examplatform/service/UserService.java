package com.examplatform.service;

import com.examplatform.model.User;
import com.examplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

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
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        // ✅ Hash password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    // ✅ Login User (check email + encrypted password)
    public User login(String email, String rawPassword) {

        email = normalizeEmail(email);

        User user = userRepository.findByEmailIgnoreCase(email);
        if (user == null) {
            throw new RuntimeException("Invalid email or password");
        }

        // ✅ Match raw password with encoded password
        if (passwordEncoder.matches(rawPassword, user.getPassword())) {
            return user;
        }

        // Backward-compatible fallback for old local records saved as plaintext passwords.
        if (rawPassword != null && rawPassword.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            return userRepository.save(user);
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
        String normalizedEmail = normalizeEmail(email);
        String normalizedGoogleId = googleId == null ? "" : googleId.trim();

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
            if (linkedByGoogle.getRole() == null || linkedByGoogle.getRole().isBlank()) {
                linkedByGoogle.setRole("STUDENT");
                changed = true;
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
            existingByEmail.setGoogleId(normalizedGoogleId);
            if ((existingByEmail.getUsername() == null || existingByEmail.getUsername().isBlank())
                    && displayName != null && !displayName.isBlank()) {
                existingByEmail.setUsername(displayName.trim());
            }
            if (existingByEmail.getRole() == null || existingByEmail.getRole().isBlank()) {
                existingByEmail.setRole("STUDENT");
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
        created.setRole("STUDENT");
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
}
