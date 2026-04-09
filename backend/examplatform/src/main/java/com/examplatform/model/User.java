package com.examplatform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    private String username;       // Display name
    private String email;          // Used for login
    private String password;       // Hashed password
    private String role = "STUDENT";
    private int totalScore = 0;    // Score tracking
    private String googleId;       // Linked Google account subject
    private String authProvider = "EMAIL";

    private boolean verified = false;  // ✅ email verified or not

    private String otp;               // ✅ store last sent OTP
    private Date otpGeneratedTime;    // ✅ timestamp to expire OTP
}
