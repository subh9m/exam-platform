package com.examplatform.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender, @Value("${spring.mail.from}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
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
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(recipient);
            helper.setSubject("Your OTP Code");
            helper.setText(html, true);

            log.info("Sending OTP email via Gmail SMTP to={} purpose={}", recipient, String.valueOf(purpose));
            mailSender.send(message);
            log.info("OTP email sent via Gmail SMTP to={} purpose={}", recipient, String.valueOf(purpose));
        } catch (Exception ex) {
            log.error("Gmail SMTP send failed for recipient={} purpose={}", recipient, String.valueOf(purpose), ex);
            throw new RuntimeException("Unable to deliver OTP email right now. Email provider error.");
        }
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
