package com.examplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:Exam Platform <no-reply@example.com>}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async("mailTaskExecutor")
    public void sendOtpAsync(String to, String purpose, String otp) {
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
        } catch (Exception ex) {
            log.error("Failed to send OTP email to={} purpose={} from={}", to, purpose, from, ex);
        }
    }
}
