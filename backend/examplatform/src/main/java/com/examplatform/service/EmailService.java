package com.examplatform.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_API_URL = "https://api.resend.com/emails";
    private static final String RESEND_FROM = "Exam Platform <onboarding@resend.dev>";

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtp(String to, String purpose, String otp) {
        String apiKey = String.valueOf(System.getenv("RESEND_API_KEY") == null ? "" : System.getenv("RESEND_API_KEY")).trim();
        if (apiKey.isBlank()) {
            throw new IllegalStateException("RESEND_API_KEY is missing on production");
        }

        String recipient = String.valueOf(to == null ? "" : to).trim();
        if (recipient.isBlank()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        String safeOtp = String.valueOf(otp == null ? "" : otp).trim();

        String html = "<strong>Your OTP is: " + escapeHtml(safeOtp) + "</strong>"
                + "<br/><br/>It will expire in 5 minutes."
                + "<br/>If you did not request this, please ignore.";

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("from", RESEND_FROM);
        body.put("to", List.of(recipient));
        body.put("subject", "Your OTP Code");
        body.put("html", html);

        log.info("Sending OTP email via Resend to={} purpose={}", recipient, String.valueOf(purpose));
        log.info("Resend payload: {}", body);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(RESEND_API_URL, HttpMethod.POST, entity, String.class);
            log.info("Resend status={} body={}", response.getStatusCode(), response.getBody());
            System.out.println("Resend Status: " + response.getStatusCode());
            System.out.println("Resend Body: " + response.getBody());

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("OTP email sent via Resend to={} purpose={}", recipient, String.valueOf(purpose));
                return;
            }

            log.error("Resend returned non-success status={} body={}", response.getStatusCode().value(), response.getBody());
            throw new RuntimeException("Unable to deliver OTP email right now. Provider status="
                    + response.getStatusCode().value() + ", body=" + response.getBody());
        } catch (HttpStatusCodeException ex) {
            log.error("Resend API error status={} body={}", ex.getStatusCode().value(), ex.getResponseBodyAsString());
            System.out.println("Resend Status: " + ex.getStatusCode());
            System.out.println("Resend Body: " + ex.getResponseBodyAsString());
            throw new RuntimeException("Unable to deliver OTP email right now. Provider error=" + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            log.error("Resend API call failed", ex);
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
