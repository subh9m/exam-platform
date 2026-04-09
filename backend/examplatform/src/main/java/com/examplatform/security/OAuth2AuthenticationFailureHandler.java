package com.examplatform.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2AuthenticationFailureHandler implements AuthenticationFailureHandler {

    @Value("${app.oauth2.redirect-base-url:http://localhost:5173}")
    private String redirectBaseUrl;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {
        String message = exception == null || exception.getMessage() == null || exception.getMessage().isBlank()
                ? "Google sign-in failed"
                : exception.getMessage();

        String target = normalizeBaseUrl(redirectBaseUrl)
                + "/auth/google/callback#error="
                + URLEncoder.encode(message, StandardCharsets.UTF_8);
        response.sendRedirect(target);
    }

    private String normalizeBaseUrl(String value) {
        String base = value == null ? "" : value.trim();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base.isBlank() ? "http://localhost:5173" : base;
    }
}
