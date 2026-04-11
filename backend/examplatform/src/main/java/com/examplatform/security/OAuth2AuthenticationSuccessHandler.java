package com.examplatform.security;

import com.examplatform.dto.auth.AuthUserDto;
import com.examplatform.model.User;
import com.examplatform.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final String OAUTH_ROLE_COOKIE = "oauth_portal_role";

    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    @Value("${app.oauth2.redirect-base-url:http://localhost:5173}")
    private String redirectBaseUrl;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, UserService userService, ObjectMapper objectMapper) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            response.sendRedirect(buildErrorRedirect("Google authentication failed"));
            return;
        }

        try {
            String email = asString(oauth2User.getAttribute("email"));
            String googleId = asString(oauth2User.getAttribute("sub"));
            String displayName = resolveDisplayName(oauth2User, email);
            String requestedRole = resolveRequestedRole(request);

            User user = userService.findOrCreateGoogleUser(email, displayName, googleId, requestedRole);
            String token = jwtUtil.generateToken(user.getId());

            String userJson = objectMapper.writeValueAsString(AuthUserDto.from(user));
            String encodedUser = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(userJson.getBytes(StandardCharsets.UTF_8));

            String target = normalizeBaseUrl(redirectBaseUrl)
                    + "/auth/google/callback#token=" + urlEncode(token)
                    + "&user=" + urlEncode(encodedUser);
            clearRoleCookie(response);
            response.sendRedirect(target);
        } catch (Exception ex) {
            clearRoleCookie(response);
            response.sendRedirect(buildErrorRedirect("Google sign-in failed"));
        }
    }

    private String resolveRequestedRole(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null || cookies.length == 0) {
            return "STUDENT";
        }

        for (Cookie cookie : cookies) {
            if (cookie != null && OAUTH_ROLE_COOKIE.equals(cookie.getName())) {
                String value = asString(cookie.getValue()).toUpperCase();
                return "TEACHER".equals(value) ? "TEACHER" : "STUDENT";
            }
        }

        return "STUDENT";
    }

    private void clearRoleCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(OAUTH_ROLE_COOKIE, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String resolveDisplayName(OAuth2User oauth2User, String fallbackEmail) {
        String name = asString(oauth2User.getAttribute("name"));
        if (!name.isBlank()) {
            return name;
        }

        String givenName = asString(oauth2User.getAttribute("given_name"));
        String familyName = asString(oauth2User.getAttribute("family_name"));
        String combined = (givenName + " " + familyName).trim();
        if (!combined.isBlank()) {
            return combined;
        }

        if (fallbackEmail == null || fallbackEmail.isBlank()) {
            return "Google User";
        }
        String[] parts = fallbackEmail.split("@");
        return parts.length > 0 ? parts[0] : fallbackEmail;
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private String normalizeBaseUrl(String value) {
        String base = value == null ? "" : value.trim();
        while (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base.isBlank() ? "http://localhost:5173" : base;
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String buildErrorRedirect(String message) {
        return normalizeBaseUrl(redirectBaseUrl)
                + "/auth/google/callback#error="
                + urlEncode(message);
    }
}
