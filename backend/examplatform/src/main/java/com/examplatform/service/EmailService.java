package com.examplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.from:Exam Platform <no-reply@example.com>}")
    private String from;

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Value("${spring.mail.port:587}")
    private int port;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}")
    private boolean startTlsEnabled;

    @Value("${spring.mail.properties.mail.smtp.starttls.required:true}")
    private boolean startTlsRequired;

    @Value("${spring.mail.properties.mail.smtp.ssl.enable:false}")
    private boolean sslEnabled;

    @Value("${spring.mail.properties.mail.smtp.ssl.trust:}")
    private String sslTrust;

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

    public void sendOtp(String to, String purpose, String otp) {
        String smtpUsername = sanitizeUsername(username);
        String smtpPassword = sanitizePassword(password);

        if (smtpUsername.isBlank() || smtpPassword.isBlank()) {
            throw new IllegalStateException("SMTP credentials are missing. Verify EMAIL_USER/EMAIL_PASS on production.");
        }

        String fromAddress = resolveFromAddress();
    int configuredPort = port > 0 ? port : 587;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromAddress);
        msg.setTo(to);
        msg.setSubject("[Exam Platform] Your " + purpose + " OTP");
        msg.setText(
                "Your OTP is: " + otp + "\n\n" +
                        "It will expire in 5 minutes.\n" +
                        "If you did not request this, please ignore."
        );
        JavaMailSenderImpl primarySender = buildSender(
                smtpUsername,
                smtpPassword,
                configuredPort,
                sslEnabled,
                startTlsEnabled,
                startTlsRequired
        );

        try {
            primarySender.send(msg);
            log.info("OTP email sent to={} purpose={} from={}", to, purpose, fromAddress);
            return;
        } catch (Exception ex) {
            log.warn("Primary SMTP send failed for to={} purpose={} host={} port={} from={}; trying fallback if enabled", to, purpose, host, configuredPort, fromAddress, ex);

            if (isAuthFailure(ex)) {
                throw new IllegalStateException("SMTP authentication failed. Verify EMAIL_USER and EMAIL_PASS (use a valid app password).");
            }

            if (!smtpFallbackEnabled) {
                log.error("Failed to send OTP email to={} purpose={} from={} and fallback is disabled", to, purpose, from, ex);
                throw buildDeliveryFailure(ex, null, false);
            }

            Exception fallbackException = null;
            try {
                boolean sentViaFallback = sendWithFallbackTransport(
                        msg,
                        smtpUsername,
                        smtpPassword,
                        to,
                        purpose,
                        fromAddress,
                        configuredPort,
                        sslEnabled
                );
                if (sentViaFallback) {
                    return;
                }
            } catch (Exception fallbackEx) {
                fallbackException = fallbackEx;
                log.error("Failed to send OTP email to={} purpose={} from={} via primary and fallback SMTP", to, purpose, from, fallbackEx);
            }

            log.error("Failed to send OTP email to={} purpose={} from={} via primary and fallback SMTP", to, purpose, from);
            throw buildDeliveryFailure(ex, fallbackException, true);
        }
    }

    private String resolveFromAddress() {
        String configured = from == null ? "" : from.trim();
        String user = sanitizeUsername(username);

        if (!configured.isBlank()) {
            Matcher m = Pattern.compile("<([^>]+)>").matcher(configured);
            if (m.find()) {
                String extracted = m.group(1).trim();
                if (!extracted.isBlank()) {
                    return extracted;
                }
            }

            if (!configured.contains(" ")) {
                return configured;
            }
        }

        if (!user.isBlank()) {
            return user;
        }

        return "no-reply@example.com";
    }

    private JavaMailSenderImpl buildSender(String smtpUsername,
                                           String smtpPassword,
                                           int targetPort,
                                           boolean useSsl,
                                           boolean useStartTls,
                                           boolean requireStartTls) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(targetPort);
        sender.setUsername(smtpUsername);
        sender.setPassword(smtpPassword);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(useStartTls));
        props.put("mail.smtp.starttls.required", String.valueOf(requireStartTls));
        props.put("mail.smtp.ssl.enable", String.valueOf(useSsl));
        props.put("mail.smtp.ssl.trust", (sslTrust == null || sslTrust.isBlank()) ? host : sslTrust);
        props.put("mail.smtp.connectiontimeout", String.valueOf(connectionTimeout));
        props.put("mail.smtp.timeout", String.valueOf(readTimeout));
        props.put("mail.smtp.writetimeout", String.valueOf(writeTimeout));

        return sender;
    }

    private boolean sendWithFallbackTransport(SimpleMailMessage msg,
                                              String smtpUsername,
                                              String smtpPassword,
                                              String to,
                                              String purpose,
                                              String fromAddress,
                                              int configuredPort,
                                              boolean configuredSslEnabled) {
        int fallbackPort = configuredSslEnabled ? 587 : smtpFallbackPort;
        boolean fallbackUseSsl = !configuredSslEnabled;
        boolean fallbackStartTls = !fallbackUseSsl;
        boolean fallbackRequireStartTls = fallbackStartTls;

        if (fallbackPort == configuredPort && fallbackUseSsl == configuredSslEnabled) {
            return false;
        }

        try {
            JavaMailSenderImpl fallbackSender = buildSender(
                    smtpUsername,
                    smtpPassword,
                    fallbackPort,
                    fallbackUseSsl,
                    fallbackStartTls,
                    fallbackRequireStartTls
            );
            fallbackSender.send(msg);
            log.info("OTP email sent via fallback SMTP to={} purpose={} host={} port={} from={}", to, purpose, host, fallbackPort, fromAddress);
            return true;
        } catch (Exception fallbackEx) {
            log.warn("Fallback SMTP send failed for to={} purpose={} host={} port={}", to, purpose, host, fallbackPort, fallbackEx);
        }

        return false;
    }

    private IllegalStateException buildDeliveryFailure(Exception primary, Exception fallback, boolean fallbackAttempted) {
        String primaryMessage = flattenMessage(primary).toLowerCase();
        String fallbackMessage = flattenMessage(fallback).toLowerCase();

        if (isAuthFailure(primary) || isAuthFailure(fallback)) {
            return new IllegalStateException("SMTP authentication failed. Verify EMAIL_USER and EMAIL_PASS (use a valid app password).");
        }

        if (primaryMessage.contains("timed out") || fallbackMessage.contains("timed out")
                || primaryMessage.contains("connect") || fallbackMessage.contains("connect")) {
            if (fallbackAttempted) {
                return new IllegalStateException("SMTP connection timed out from server. Check provider restrictions or use an API-based email provider.");
            }
            return new IllegalStateException("SMTP connection timed out from server.");
        }

        return new IllegalStateException("Unable to deliver OTP email right now. Please check email settings and try again.");
    }

    private boolean isAuthFailure(Exception ex) {
        String message = flattenMessage(ex).toLowerCase();
        return message.contains("535")
                || message.contains("authentication failed")
                || message.contains("username and password not accepted")
                || message.contains("auth") && message.contains("invalid credentials");
    }

    private String flattenMessage(Exception ex) {
        if (ex == null) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        Throwable current = ex;
        while (current != null) {
            if (current.getMessage() != null && !current.getMessage().isBlank()) {
                if (sb.length() > 0) {
                    sb.append(" | ");
                }
                sb.append(current.getMessage());
            }
            current = current.getCause();
        }
        return sb.toString();
    }

    private String sanitizeUsername(String value) {
        if (value == null) {
            return "";
        }

        String trimmed = value.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }
        return trimmed;
    }

    private String sanitizePassword(String value) {
        if (value == null) {
            return "";
        }

        String trimmed = value.trim();
        if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
                || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).trim();
        }

        // Gmail app passwords are often pasted with spaces between 4-char groups.
        if ("smtp.gmail.com".equalsIgnoreCase(host)) {
            return trimmed.replaceAll("\\s+", "");
        }

        return trimmed;
    }
}
