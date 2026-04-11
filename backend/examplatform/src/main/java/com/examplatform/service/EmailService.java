package com.examplatform.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final int magicLinkExpiryMinutes;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.from:${spring.mail.username}}") String fromAddress,
                        @Value("${app.magic-link.expiry-minutes:10}") int magicLinkExpiryMinutes) {
        this.mailSender = mailSender;
        this.fromAddress = sanitize(fromAddress);
        this.magicLinkExpiryMinutes = Math.max(5, Math.min(10, magicLinkExpiryMinutes));
    }

    public void sendOtp(String to, String purpose, String otp) {
        String recipient = String.valueOf(to == null ? "" : to).trim();
        if (recipient.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        String safeOtp = String.valueOf(otp == null ? "" : otp).trim();

        String html = "<strong>Your OTP is: " + escapeHtml(safeOtp) + "</strong>"
                + "<br/><br/>It will expire in 5 minutes."
                + "<br/>If you did not request this, please ignore.";

        try {
            sendHtmlEmail(recipient, "Your OTP Code", html);
            log.info("OTP email sent via Gmail SMTP to={} purpose={}", recipient, String.valueOf(purpose));
        } catch (Exception ex) {
            log.error("OTP email send failed for recipient={} purpose={}", recipient, String.valueOf(purpose), ex);
            throw new IllegalStateException("Unable to deliver OTP email right now. Email provider error.");
        }
    }

    public void sendMagicLink(String to, String purpose, String verificationUrl) {
        String recipient = String.valueOf(to == null ? "" : to).trim();
        if (recipient.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        String normalizedPurpose = String.valueOf(purpose == null ? "LOGIN" : purpose).trim().toUpperCase();
        String actionLabel = "REGISTER".equals(normalizedPurpose) ? "complete your registration" : "log in to your account";
        String titleLabel = "REGISTER".equals(normalizedPurpose) ? "Complete Your Registration" : "Complete Your Login";

        String safeUrl = escapeHtml(String.valueOf(verificationUrl == null ? "" : verificationUrl).trim());
        if (safeUrl.isBlank()) {
            throw new IllegalArgumentException("Verification URL is required");
        }

        String html = "<p>Hello,</p>"
                + "<p>Click the link below to " + actionLabel + ":</p>"
                + "<p><a href=\"" + safeUrl + "\">" + safeUrl + "</a></p>"
                + "<p>This link will expire in " + magicLinkExpiryMinutes + " minutes.</p>"
                + "<p>If you did not request this email, you can safely ignore it.</p>";

        try {
            sendHtmlEmail(recipient, titleLabel, html);
            log.info("Magic link email sent via Gmail SMTP to={} purpose={}", recipient, normalizedPurpose);
        } catch (Exception ex) {
            log.error("Magic link email send failed for recipient={} purpose={}", recipient, normalizedPurpose, ex);
            throw new IllegalStateException("Unable to send verification link right now. Email provider error.");
        }
    }

    private void sendHtmlEmail(String recipient, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception ex) {
            throw new IllegalStateException("Email delivery failed", ex);
        }
    }

    private String sanitize(String value) {
        return value == null ? "" : value.trim();
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
