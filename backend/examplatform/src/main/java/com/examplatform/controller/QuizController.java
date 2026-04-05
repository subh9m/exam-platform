package com.examplatform.controller;

import com.examplatform.model.Question;
import com.examplatform.model.QuizResult;
import com.examplatform.security.JwtUtil;
import com.examplatform.service.QuizService;
import com.examplatform.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    private static final Logger log = LoggerFactory.getLogger(QuizController.class);

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
    public ResponseEntity<?> submitQuiz(@RequestBody Map<String, Object> submissionData, HttpServletRequest request) {
        try {
            String userId = resolveUserId(request);
            if (userId == null || userId.isBlank()) {
                return ResponseEntity.status(401).body(Map.of("error", "User not authenticated"));
            }

            String subject = (String) submissionData.get("subject");
            String testId = (String) submissionData.get("testId");

            Map<String, String> answers = new HashMap<>();
            Object answersObj = submissionData.get("answers");
            if (!(answersObj instanceof Map<?, ?> raw)) {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid answers format"));
            }

            raw.forEach((k, v) -> {
                if (k != null && v != null) {
                    answers.put(String.valueOf(k), String.valueOf(v));
                }
            });

            log.info("Quiz submit answers received: count={}, keys={}", answers.size(), answers.keySet());

            int score;
            if (testId == null || testId.isBlank()) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> questions = submissionData.get("questions") instanceof List<?>
                        ? (List<Map<String, Object>>) submissionData.get("questions")
                        : List.of();

                if (questions.isEmpty()) {
                    return ResponseEntity.status(400).body(Map.of("error", "No questions submitted"));
                }

                score = quizService.submitQuizDynamic(userId, subject, answers, questions);
            } else {
                score = quizService.submitQuiz(userId, subject, testId, answers);
            }

                Map<String, Object> payload = new HashMap<>();
                payload.put("message", "Quiz submitted successfully!");
                payload.put("subject", subject == null ? "" : subject);
                payload.put("testId", testId == null ? "" : testId);
                payload.put("score", score);
                return ResponseEntity.ok(payload);

                } catch (IllegalArgumentException e) {
                    log.warn("Quiz submit validation failed: {}", e.getMessage());
                    return ResponseEntity.status(400).body(Map.of(
                        "error", safeMessage(e, "Invalid quiz submission")
                    ));

                } catch (IllegalStateException e) {
                    log.warn("Quiz submit state failed: {}", e.getMessage());
                    return ResponseEntity.status(400).body(Map.of(
                        "error", safeMessage(e, "Invalid quiz submission state")
                    ));

        } catch (Exception e) {
                    log.error("Quiz submit failed unexpectedly", e);
                    return ResponseEntity.status(500).body(Map.of(
                        "error", safeMessage(e, "Quiz submission failed")
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
            log.warn("Failed to resolve user from token: {}", ex.getMessage());
            return null;
        }
    }

    private String safeMessage(Exception ex, String fallback) {
        if (ex == null || ex.getMessage() == null || ex.getMessage().isBlank()) {
            return fallback;
        }
        return ex.getMessage();
    }

}
