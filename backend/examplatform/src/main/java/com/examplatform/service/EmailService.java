package com.examplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.mail.from:Exam Platform <onboarding@resend.dev>}")
    private String from;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    public void sendOtp(String to, String purpose, String otp) {
        String apiKey = String.valueOf(resendApiKey == null ? "" : resendApiKey).trim();
        if (apiKey.isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is missing on production");
        }

        String recipient = String.valueOf(to == null ? "" : to).trim();
        if (recipient.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        String sender = String.valueOf(from == null ? "" : from).trim();
        if (sender.isBlank()) {
            sender = "Exam Platform <onboarding@resend.dev>";
        }

        String normalizedPurpose = String.valueOf(purpose == null ? "OTP" : purpose).trim().toUpperCase();
        String safeOtp = String.valueOf(otp == null ? "" : otp).trim();

        String html = "<strong>Your OTP is: " + escapeHtml(safeOtp) + "</strong>"
                + "<br/><br/>It will expire in 5 minutes."
                + "<br/>If you did not request this, please ignore.";

        Map<String, Object> body = new HashMap<>();
        body.put("from", sender);
        body.put("to", List.of(recipient));
        body.put("subject", "Your " + normalizedPurpose + " OTP Code");
        body.put("html", html);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("OTP email sent via Resend to={} purpose={}", recipient, normalizedPurpose);
                return;
            }

            log.error("Resend returned non-success status={} body={}", response.getStatusCode().value(), response.getBody());
            throw new IllegalStateException("Unable to deliver OTP email right now. Email provider rejected request.");
        } catch (HttpStatusCodeException ex) {
            log.error("Resend API error status={} body={}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
            throw new IllegalStateException("Unable to deliver OTP email right now. Email provider error.");
        } catch (Exception ex) {
            log.error("Resend API call failed", ex);
            throw new IllegalStateException("Unable to deliver OTP email right now. Please try again.");
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
