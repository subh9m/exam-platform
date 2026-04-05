package com.examplatform.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "otp_codes")
public class OtpCode {
    @Id
    private String id;
    private String email;
    private String purpose;       // REGISTER | LOGIN
    private String code;          // 6 digit OTP
    private Instant createdAt;
    private Instant lastRequestAt;
    private Instant expiresAt;
    private int attempts;         // Prevent brute-force
}
