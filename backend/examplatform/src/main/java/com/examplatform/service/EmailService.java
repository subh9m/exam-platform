package com.examplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:Exam Platform <no-reply@example.com>}")
    private String from;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Value("${app.mail.smtp-fallback-enabled:true}")
    private boolean smtpFallbackEnabled;

    @Value("${app.mail.smtp-fallback-port:465}")
    private int smtpFallbackPort;

    @Value("${spring.mail.properties.mail.smtp.connectiontimeout:5000}")
    private int connectionTimeout;

    @Value("${spring.mail.properties.mail.smtp.timeout:5000}")
    private int readTimeout;

    @Value("${spring.mail.properties.mail.smtp.writetimeout:5000}")
    private int writeTimeout;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean sendOtp(String to, String purpose, String otp) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            log.error("SMTP credentials are missing. EMAIL_USER/EMAIL_PASS must be configured.");
            return false;
        }

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("[Exam Platform] Your " + purpose + " OTP");
        msg.setText(
                "Your OTP is: " + otp + "\n\n" +
                        "It will expire in 5 minutes.\n" +
                        "If you did not request this, please ignore."
        );
        try {
            mailSender.send(msg);
            log.info("OTP email sent to={} purpose={}", to, purpose);
            return true;
        } catch (Exception ex) {
            log.warn("Primary SMTP send failed for to={} purpose={} host={} port=587; trying fallback if enabled", to, purpose, host, ex);

            if (!smtpFallbackEnabled) {
                log.error("Failed to send OTP email to={} purpose={} from={} and fallback is disabled", to, purpose, from, ex);
                return false;
            }

            try {
                JavaMailSenderImpl fallbackSender = buildFallbackSender();
                fallbackSender.send(msg);
                log.info("OTP email sent via fallback SMTP to={} purpose={} host={} port={}", to, purpose, host, smtpFallbackPort);
                return true;
            } catch (Exception fallbackEx) {
                log.error("Failed to send OTP email to={} purpose={} from={} via primary and fallback SMTP", to, purpose, from, fallbackEx);
                return false;
            }
        }
    }

    private JavaMailSenderImpl buildFallbackSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(smtpFallbackPort);
        sender.setUsername(username);
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.smtp.starttls.required", "false");
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.ssl.trust", host);
        props.put("mail.smtp.connectiontimeout", String.valueOf(connectionTimeout));
        props.put("mail.smtp.timeout", String.valueOf(readTimeout));
        props.put("mail.smtp.writetimeout", String.valueOf(writeTimeout));

        return sender;
    }
}
