package com.examplatform.service;

import com.examplatform.model.OtpCode;
import com.examplatform.repository.OtpCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpCodeRepository otpRepo;
    private final EmailService emailService;
    private final SecureRandom rnd = new SecureRandom();
    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration OTP_RATE_LIMIT_WINDOW = Duration.ofMinutes(5);
    private static final int MAX_OTP_REQUESTS_PER_WINDOW = 3;

    public OtpService(OtpCodeRepository otpRepo, EmailService emailService) {
        this.otpRepo = otpRepo;
        this.emailService = emailService;
    }

    public void issueOtp(String email, String purpose) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (purpose == null || purpose.isBlank()) {
            throw new IllegalArgumentException("OTP purpose is required");
        }

        email = email.toLowerCase().trim();
        purpose = purpose.toUpperCase().trim();
        Instant now = Instant.now();

        long recentRequests = otpRepo.countByEmailAndCreatedAtAfter(email, now.minus(OTP_RATE_LIMIT_WINDOW));
        if (recentRequests >= MAX_OTP_REQUESTS_PER_WINDOW) {
            throw new IllegalStateException("Too many OTP requests. Maximum 3 requests in 5 minutes.");
        }

        String code = String.format("%06d", rnd.nextInt(1_000_000));

        OtpCode otp = new OtpCode();
        otp.setEmail(email);
        otp.setPurpose(purpose);
        otp.setCode(code);
        otp.setCreatedAt(now);
        otp.setLastRequestAt(now);
        otp.setExpiresAt(now.plus(OTP_TTL));
        otp.setAttempts(0);

        otpRepo.save(otp);

        boolean delivered = emailService.sendOtp(email, purpose, code);
        if (!delivered) {
            otpRepo.delete(otp);
            log.error("OTP generation aborted because email delivery failed for purpose={} to={}", purpose, email);
            throw new IllegalStateException("Unable to deliver OTP email right now. Please check email settings and try again.");
        }

        log.info("OTP generated and delivered for purpose={} to={}", purpose, email);
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
