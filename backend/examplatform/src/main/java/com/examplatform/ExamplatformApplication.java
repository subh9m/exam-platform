package com.examplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ExamplatformApplication {

    static {
        // Production-safe networking hint: prefer IPv4 to avoid intermittent IPv6 SMTP connect stalls.
        System.setProperty("java.net.preferIPv4Stack", "true");
        System.setProperty("java.net.preferIPv6Addresses", "false");
    }

    public static void main(String[] args) {
        SpringApplication.run(ExamplatformApplication.class, args);
    }

}
