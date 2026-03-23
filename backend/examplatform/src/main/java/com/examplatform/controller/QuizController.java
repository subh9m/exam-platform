package com.examplatform.controller;

import com.examplatform.model.Question;
import com.examplatform.model.QuizResult;
import com.examplatform.security.JwtUtil;
import com.examplatform.service.QuizService;
import com.examplatform.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    // ✅ Get attempt history for user
    @GetMapping("/history/{userId}")
    public List<QuizResult> getHistory(@PathVariable String userId) {
        return quizService.getHistory(userId);
    }

    @GetMapping("/my-results")
    public ResponseEntity<?> getMyResults(HttpServletRequest request) {
        String userId = resolveUserId(request);
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(quizService.getHistory(userId));
    }

    // ✅ Get specific attempt detail
    @GetMapping("/history/detail/{attemptId}")
    public QuizResult getAttemptDetail(@PathVariable String attemptId) {
        return quizService.getAttemptDetail(attemptId);
    }

    // ✅ Fetch ALL questions by testId
    @GetMapping("/all/test/{testId}")
    public List<Question> getAllQuestionsByTest(@PathVariable String testId) {
        return quizService.getQuestionsByTestId(testId);
    }

    // ✅ Submit quiz and calculate score
    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody Map<String, Object> submissionData) {
        try {
            String userId = (String) submissionData.get("userId");
            String subject = (String) submissionData.get("subject");
            String testId = (String) submissionData.get("testId");

            if (testId == null || testId.isBlank()) {
                return ResponseEntity.status(400).body(Map.of("error", "testId is required"));
            }

            Map<String, String> answers = new HashMap<>();
            Object answersObj = submissionData.get("answers");
            if (answersObj instanceof Map<?, ?> raw) {
                raw.forEach((k, v) -> {
                    if (k instanceof String key && v instanceof String value) {
                        answers.put(key, value);
                    }
                });
            }

            int score = quizService.submitQuiz(userId, subject, testId, answers);

            return ResponseEntity.ok(Map.of(
                    "message", "Quiz submitted successfully!",
                    "subject", subject,
                    "testId", testId,
                    "score", score
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    // ✅ Leaderboard
    @GetMapping("/leaderboard")
    public List<Map<String, Object>> leaderboard(@RequestParam(required = false) String testId) {
        return quizService.getLeaderboardByTest(testId);
    }

    private String resolveUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }

        try {
            String token = header.substring(7);
            String userId = jwtUtil.extractUserId(token);
            return userService.findById(userId) == null ? null : userId;
        } catch (Exception ex) {
            return null;
        }
    }
}
