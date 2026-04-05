package com.examplatform.controller;

import com.examplatform.model.Subject;
import com.examplatform.model.User;
import com.examplatform.security.JwtUtil;
import com.examplatform.service.SubjectService;
import com.examplatform.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public SubjectController(SubjectService subjectService, JwtUtil jwtUtil, UserService userService) {
        this.subjectService = subjectService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectService.getAllSubjects();
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<?> deleteSubject(@PathVariable String subjectId, HttpServletRequest request) {
        User teacher = resolveTeacher(request);
        if (teacher == null) {
            return ResponseEntity.status(403).body(Map.of("message", "Only teachers can delete subjects"));
        }

        try {
            subjectService.deleteSubjectForTeacher(subjectId, teacher.getEmail());
            return ResponseEntity.ok(Map.of("message", "Subject deleted successfully"));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(403).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
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
