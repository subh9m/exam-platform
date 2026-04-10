package com.examplatform.config;

import com.examplatform.security.JwtFilter;
import com.examplatform.security.OAuth2AuthenticationFailureHandler;
import com.examplatform.security.OAuth2AuthenticationSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;
    private final OAuth2AuthenticationFailureHandler oauth2FailureHandler;

    @Value("${APP_CORS_ALLOWED_ORIGINS:http://localhost:5173,http://127.0.0.1:5173,https://*.vercel.app}")
    private String allowedOrigins;

    public SecurityConfig(JwtFilter jwtFilter,
                          OAuth2AuthenticationSuccessHandler oauth2SuccessHandler,
                          OAuth2AuthenticationFailureHandler oauth2FailureHandler) {
        this.jwtFilter = jwtFilter;
        this.oauth2SuccessHandler = oauth2SuccessHandler;
        this.oauth2FailureHandler = oauth2FailureHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> {}) // enable CORS properly
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // allow preflight
                .requestMatchers("/health", "/actuator/health").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oauth2SuccessHandler)
                .failureHandler(oauth2FailureHandler)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(parseAllowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    private List<String> parseAllowedOrigins() {
        return Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .map(origin -> origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin)
                .filter(origin -> !origin.isBlank())
                .distinct()
                .toList();
    }
}