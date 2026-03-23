package com.examplatform.controller;

import com.examplatform.model.Question;
import com.examplatform.model.Test;
import com.examplatform.service.QuizService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "http://localhost:5173")
public class TestController {

    private final QuizService quizService;

    public TestController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/{subject}")
    public List<Test> getTestsBySubject(@PathVariable String subject) {
        return quizService.getTestsBySubject(subject);
    }

    @GetMapping("/{testId}/questions")
    public List<Question> getQuestionsByTest(@PathVariable String testId) {
        return quizService.getQuestionsByTestId(testId);
    }
}
