package com.examplatform.controller;

import com.examplatform.model.Question;
import com.examplatform.model.Subject;
import com.examplatform.model.Test;
import com.examplatform.model.User;
import com.examplatform.security.JwtUtil;
import com.examplatform.service.QuizService;
import com.examplatform.service.SubjectService;
import com.examplatform.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:5173")
public class TeacherController {

    private final QuizService quizService;
    private final SubjectService subjectService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public TeacherController(QuizService quizService, SubjectService subjectService, JwtUtil jwtUtil, UserService userService) {
        this.quizService = quizService;
        this.subjectService = subjectService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> createSubject(@RequestBody Map<String, String> body, HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can create subjects"));
        }

        try {
            String name = body.get("name");
            String description = body.get("description");
            Subject subject = subjectService.createSubject(name, description, teacher.getEmail());
            return ResponseEntity.ok(subject);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/tests")
    public ResponseEntity<?> createTest(@RequestBody Map<String, String> body, HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can create tests"));
        }

        try {
            String subject = body.get("subject");
            String testName = body.get("testName");
            Test test = quizService.createTest(subject, testName, teacher.getEmail());
            return ResponseEntity.ok(test);
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/tests")
    public ResponseEntity<?> myTests(HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can view tests"));
        }
        List<Test> tests = quizService.getTestsByTeacher(teacher.getEmail());
        return ResponseEntity.ok(tests);
    }

    @PostMapping("/questions")
    public ResponseEntity<?> addQuestion(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can add questions"));
        }

        try {
            String testId = (String) body.get("testId");
            String type = (String) body.get("type");
            String questionText = (String) body.get("questionText");
            String correctAnswer = (String) body.get("correctAnswer");
            String explanation = (String) body.get("explanation");
            @SuppressWarnings("unchecked")
            List<String> options = (List<String>) body.get("options");

            Question saved = quizService.addQuestionToTest(testId, type, questionText, options, correctAnswer, explanation, teacher.getEmail());
            return ResponseEntity.ok(saved);
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable String questionId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can update questions"));
        }

        try {
            String type = (String) body.get("type");
            String questionText = (String) body.get("questionText");
            String correctAnswer = (String) body.get("correctAnswer");
            String explanation = (String) body.get("explanation");
            @SuppressWarnings("unchecked")
            List<String> options = (List<String>) body.get("options");

            Question updated = quizService.updateQuestionForTeacher(
                    questionId,
                    type,
                    questionText,
                    options,
                    correctAnswer,
                    explanation,
                    teacher.getEmail()
            );
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(403).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String questionId, HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can delete questions"));
        }

        try {
            quizService.deleteQuestionForTeacher(questionId, teacher.getEmail());
            return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(403).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @DeleteMapping("/tests/{testId}")
    public ResponseEntity<?> deleteTest(@PathVariable String testId, HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can delete tests"));
        }

        try {
            quizService.deleteTestForTeacher(testId, teacher.getEmail());
            return ResponseEntity.ok(Map.of("message", "Test deleted successfully"));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(403).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/results")
    public ResponseEntity<?> results(HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can view results"));
        }
        return ResponseEntity.ok(quizService.getTeacherResults(teacher.getEmail()));
    }

    private User resolveTeacher(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }

        try {
            String token = header.substring(7);
            String userId = jwtUtil.extractUserId(token);
            User user = userService.findById(userId);
            if (user == null || user.getRole() == null) {
                return null;
            }

            return "TEACHER".equalsIgnoreCase(user.getRole()) ? user : null;
        } catch (Exception ex) {
            return null;
        }
    }
}
