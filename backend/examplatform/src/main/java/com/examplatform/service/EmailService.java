package com.examplatform.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:Exam Platform <no-reply@example.com>}")
    private String from;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(String to, String purpose, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("[Exam Platform] Your " + purpose + " OTP");
        msg.setText(
                "Your OTP is: " + otp + "\n\n" +
                        "It will expire in 5 minutes.\n" +
                        "If you did not request this, please ignore."
        );
        mailSender.send(msg);
    }
}
