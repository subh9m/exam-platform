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

        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("Invalid email or password");
        }

        // ✅ Match raw password with encoded password
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return user;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User findById(String id) {
        return userRepository.findById(id).orElse(null);
    }
}
