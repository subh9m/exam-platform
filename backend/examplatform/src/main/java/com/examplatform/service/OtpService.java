package com.examplatform.service;

import com.examplatform.model.OtpCode;
import com.examplatform.repository.OtpCodeRepository;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
public class OtpService {

    private final OtpCodeRepository otpRepo;
    private final EmailService emailService;
    private final SecureRandom rnd = new SecureRandom();
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final int MAX_ATTEMPTS = 5;

    public OtpService(OtpCodeRepository otpRepo, EmailService emailService) {
        this.otpRepo = otpRepo;
        this.emailService = emailService;
    }

    public void issueOtp(String email, String purpose) {
        email = email.toLowerCase().trim();
        purpose = purpose.toUpperCase().trim();

        // delete old OTPs
        otpRepo.deleteByEmailAndPurpose(email, purpose);

        String code = String.format("%06d", rnd.nextInt(1_000_000));

        OtpCode otp = new OtpCode();
        otp.setEmail(email);
        otp.setPurpose(purpose);
        otp.setCode(code);
        otp.setCreatedAt(Instant.now());
        otp.setExpiresAt(Instant.now().plus(OTP_TTL));
        otp.setAttempts(0);

        otpRepo.save(otp);

        // 🔥 SAFE EMAIL BLOCK
        try {
            emailService.sendOtp(email, purpose, code);
            System.out.println("OTP sent via email");
        } catch (Exception e) {
            System.out.println("Email failed. OTP for " + email + ": " + code);
        }
    }

    public boolean verifyOtp(String email, String purpose, String code) {
        email = email.toLowerCase().trim();
        purpose = purpose.toUpperCase().trim();
        code = code.trim(); // ✅ IMPORTANT

        var recOpt = otpRepo.findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose);
        if (recOpt.isEmpty()) return false;

        OtpCode rec = recOpt.get();

        // ✅ Expired?
        if (Instant.now().isAfter(rec.getExpiresAt())) return false;

        // ✅ Max attempt limit?
        if (rec.getAttempts() >= MAX_ATTEMPTS) return false;

        boolean ok = rec.getCode().equals(code);

        // Always increment attempts
        rec.setAttempts(rec.getAttempts() + 1);
        otpRepo.save(rec);

        return ok;
    }

}
