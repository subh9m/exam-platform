package com.examplatform.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import java.util.Properties;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String mailHost;
    private final String mailUsername;
    private final String mailPassword;
    private final int fallbackPort;
    private final boolean fallbackEnabled;
    private final String smtpConnectionTimeoutMs;
    private final String smtpTimeoutMs;
    private final String smtpWriteTimeoutMs;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.from}") String fromAddress,
                        @Value("${spring.mail.host:smtp.gmail.com}") String mailHost,
                        @Value("${spring.mail.username:}") String mailUsername,
                        @Value("${spring.mail.password:}") String mailPassword,
                        @Value("${app.mail.smtp-fallback-port:465}") int fallbackPort,
                        @Value("${app.mail.smtp-fallback-enabled:true}") boolean fallbackEnabled,
                        @Value("${spring.mail.properties.mail.smtp.connectiontimeout:12000}") String smtpConnectionTimeoutMs,
                        @Value("${spring.mail.properties.mail.smtp.timeout:12000}") String smtpTimeoutMs,
                        @Value("${spring.mail.properties.mail.smtp.writetimeout:12000}") String smtpWriteTimeoutMs) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.mailHost = mailHost;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
        this.fallbackPort = fallbackPort;
        this.fallbackEnabled = fallbackEnabled;
        this.smtpConnectionTimeoutMs = smtpConnectionTimeoutMs;
        this.smtpTimeoutMs = smtpTimeoutMs;
        this.smtpWriteTimeoutMs = smtpWriteTimeoutMs;
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
            log.info("Sending OTP email via Gmail SMTP to={} purpose={}", recipient, String.valueOf(purpose));
            sendWith(mailSender, recipient, html);
            log.info("OTP email sent via Gmail SMTP to={} purpose={}", recipient, String.valueOf(purpose));
        } catch (MailException ex) {
            log.error("Primary Gmail SMTP send failed for recipient={} purpose={}", recipient, String.valueOf(purpose), ex);

            if (!fallbackEnabled || mailUsername.isBlank() || mailPassword.isBlank()) {
                throw new RuntimeException("Unable to deliver OTP email right now. Email provider error.");
            }

            try {
                log.info("Retrying OTP send via Gmail SMTP fallback port={} to={} purpose={}", fallbackPort, recipient, String.valueOf(purpose));
                sendWith(buildFallbackSender(), recipient, html);
                log.info("OTP email sent via Gmail SMTP fallback port={} to={} purpose={}", fallbackPort, recipient, String.valueOf(purpose));
            } catch (Exception fallbackEx) {
                log.error("Gmail SMTP fallback send failed for recipient={} purpose={}", recipient, String.valueOf(purpose), fallbackEx);
                throw new RuntimeException("Unable to deliver OTP email right now. Email provider error.");
            }
        } catch (Exception ex) {
            log.error("Gmail SMTP send failed for recipient={} purpose={}", recipient, String.valueOf(purpose), ex);
            throw new RuntimeException("Unable to deliver OTP email right now. Email provider error.");
        }
    }

    private void sendWith(JavaMailSender sender, String recipient, String html) throws MessagingException {
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(recipient);
        helper.setSubject("Your OTP Code");
        helper.setText(html, true);
        sender.send(message);
    }

    private JavaMailSender buildFallbackSender() {
        JavaMailSenderImpl fallbackSender = new JavaMailSenderImpl();
        fallbackSender.setHost(mailHost);
        fallbackSender.setPort(fallbackPort);
        fallbackSender.setUsername(mailUsername);
        fallbackSender.setPassword(mailPassword);

        Properties props = fallbackSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.smtp.starttls.required", "false");
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.ssl.trust", mailHost);
        props.put("mail.smtp.connectiontimeout", smtpConnectionTimeoutMs);
        props.put("mail.smtp.timeout", smtpTimeoutMs);
        props.put("mail.smtp.writetimeout", smtpWriteTimeoutMs);

        return fallbackSender;
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
