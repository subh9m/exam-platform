package com.examplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ExamplatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamplatformApplication.class, args);
    }

}
