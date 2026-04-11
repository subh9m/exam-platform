package com.examplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
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
        String fromAddress = resolveFromAddress();

        if (smtpUsername.isBlank() || smtpPassword.isBlank()) {
            throw new IllegalStateException("SMTP credentials are missing. Verify EMAIL_USER/EMAIL_PASS on production.");
        }

        String smtpHost = sanitizeHost(host);
        int configuredPort = port > 0 ? port : 587;
        List<SmtpAttempt> attempts = buildAttempts(smtpHost, configuredPort);

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(fromAddress);
        msg.setTo(to);
        msg.setSubject("[Exam Platform] Your " + purpose + " OTP");
        msg.setText(
                "Your OTP is: " + otp + "\n\n" +
                        "It will expire in 5 minutes.\n" +
                        "If you did not request this, please ignore."
        );

        Exception lastFailure = null;
        boolean timeoutSeen = false;

        for (SmtpAttempt attempt : attempts) {
            try {
                JavaMailSenderImpl sender = buildSender(
                        attempt.host,
                        smtpUsername,
                        smtpPassword,
                        attempt.port,
                        attempt.useSsl,
                        attempt.useStartTls,
                        attempt.requireStartTls
                );
                sender.send(msg);
                log.info("OTP email sent to={} purpose={} from={} via {}:{}", to, purpose, fromAddress, attempt.host, attempt.port);
                return;
            } catch (Exception ex) {
                lastFailure = ex;
                timeoutSeen = timeoutSeen || isTimeoutFailure(ex);
                log.warn("SMTP send failed via {}:{} ssl={} starttls={} to={} purpose={}",
                        attempt.host,
                        attempt.port,
                        attempt.useSsl,
                        attempt.useStartTls,
                        to,
                        purpose,
                        ex);

                if (isAuthFailure(ex)) {
                    throw new IllegalStateException("SMTP authentication failed. Verify EMAIL_USER and EMAIL_PASS (use a valid app password).");
                }
            }
        }

        if (timeoutSeen) {
            throw new IllegalStateException("SMTP connection timed out from server. Outbound SMTP to Gmail is timing out in production.");
        }

        throw buildDeliveryFailure(lastFailure);
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

    private JavaMailSenderImpl buildSender(String smtpHost,
                                           String smtpUsername,
                                           String smtpPassword,
                                           int targetPort,
                                           boolean useSsl,
                                           boolean useStartTls,
                                           boolean requireStartTls) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(smtpHost);
        sender.setPort(targetPort);
        sender.setUsername(smtpUsername);
        sender.setPassword(smtpPassword);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(useStartTls));
        props.put("mail.smtp.starttls.required", String.valueOf(requireStartTls));
        props.put("mail.smtp.ssl.enable", String.valueOf(useSsl));
        props.put("mail.smtp.ssl.trust", (sslTrust == null || sslTrust.isBlank()) ? smtpHost : sslTrust);
        props.put("mail.smtp.connectiontimeout", String.valueOf(connectionTimeout));
        props.put("mail.smtp.timeout", String.valueOf(readTimeout));
        props.put("mail.smtp.writetimeout", String.valueOf(writeTimeout));

        return sender;
    }

    private List<SmtpAttempt> buildAttempts(String smtpHost, int configuredPort) {
        List<SmtpAttempt> attempts = new ArrayList<>();
        LinkedHashSet<String> dedupe = new LinkedHashSet<>();

        addAttempt(attempts, dedupe, smtpHost, configuredPort, sslEnabled, startTlsEnabled, startTlsRequired);

        if (smtpFallbackEnabled) {
            int fallbackPort = smtpFallbackPort > 0 ? smtpFallbackPort : 465;
            boolean fallbackSsl = fallbackPort == 465;
            boolean fallbackTls = !fallbackSsl;
            addAttempt(attempts, dedupe, smtpHost, fallbackPort, fallbackSsl, fallbackTls, fallbackTls);

            if (configuredPort != 587) {
                addAttempt(attempts, dedupe, smtpHost, 587, false, true, true);
            }
            if (configuredPort != 465) {
                addAttempt(attempts, dedupe, smtpHost, 465, true, false, false);
            }
        }

        if (isGmailHost(smtpHost)) {
            String alias = "smtp.gmail.com".equalsIgnoreCase(smtpHost) ? "smtp.googlemail.com" : "smtp.gmail.com";
            addAttempt(attempts, dedupe, alias, configuredPort, sslEnabled, startTlsEnabled, startTlsRequired);
            addAttempt(attempts, dedupe, alias, 587, false, true, true);
            addAttempt(attempts, dedupe, alias, 465, true, false, false);
        }

        return attempts;
    }

    private void addAttempt(List<SmtpAttempt> attempts,
                            LinkedHashSet<String> dedupe,
                            String smtpHost,
                            int smtpPort,
                            boolean useSsl,
                            boolean useStartTls,
                            boolean requireStartTls) {
        String key = smtpHost + "|" + smtpPort + "|" + useSsl + "|" + useStartTls + "|" + requireStartTls;
        if (dedupe.add(key)) {
            attempts.add(new SmtpAttempt(smtpHost, smtpPort, useSsl, useStartTls, requireStartTls));
        }
    }

    private boolean isGmailHost(String smtpHost) {
        return "smtp.gmail.com".equalsIgnoreCase(smtpHost) || "smtp.googlemail.com".equalsIgnoreCase(smtpHost);
    }

    private IllegalStateException buildDeliveryFailure(Exception failure) {
        if (isAuthFailure(failure)) {
            return new IllegalStateException("SMTP authentication failed. Verify EMAIL_USER and EMAIL_PASS (use a valid app password).");
        }
        if (isTimeoutFailure(failure)) {
            return new IllegalStateException("SMTP connection timed out from server. Outbound SMTP to Gmail is timing out in production.");
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

    private boolean isTimeoutFailure(Exception ex) {
        String message = flattenMessage(ex).toLowerCase();
        return message.contains("timed out")
                || message.contains("timeout")
                || message.contains("connect")
                || message.contains("connection reset");
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

    private String sanitizeHost(String value) {
        String normalized = value == null ? "" : value.trim();
        return normalized.isBlank() ? "smtp.gmail.com" : normalized;
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
        if (isGmailHost(sanitizeHost(host))) {
            return trimmed.replaceAll("\\s+", "");
        }

        return trimmed;
    }

    private static final class SmtpAttempt {
        private final String host;
        private final int port;
        private final boolean useSsl;
        private final boolean useStartTls;
        private final boolean requireStartTls;

        private SmtpAttempt(String host, int port, boolean useSsl, boolean useStartTls, boolean requireStartTls) {
            this.host = host;
            this.port = port;
            this.useSsl = useSsl;
            this.useStartTls = useStartTls;
            this.requireStartTls = requireStartTls;
        }
    }
}
