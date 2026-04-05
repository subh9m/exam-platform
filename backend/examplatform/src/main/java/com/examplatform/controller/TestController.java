package com.examplatform.controller;

import com.examplatform.model.Question;
import com.examplatform.model.Test;
import com.examplatform.service.QuizService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
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
    public List<Map<String, Object>> getQuestionsByTest(@PathVariable String testId) {
        return quizService.getQuestionsByTestId(testId).stream()
                .map(this::toPublicQuestion)
                .toList();
    }

    private Map<String, Object> toPublicQuestion(Question question) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", question.getId());
        payload.put("subject", question.getSubject());
        payload.put("testId", question.getTestId());
        payload.put("createdBy", question.getCreatedBy());
        payload.put("type", question.getType());
        payload.put("questionText", question.getQuestionText());
        payload.put("options", question.getOptions());
        payload.put("explanation", question.getExplanation());
        return payload;
    }
}
