package com.examplatform.service;

import com.examplatform.model.Subject;
import com.examplatform.model.Test;
import com.examplatform.model.User;
import com.examplatform.repository.OtpCodeRepository;
import com.examplatform.repository.QuestionRepository;
import com.examplatform.repository.QuizResultRepository;
import com.examplatform.repository.SubjectRepository;
import com.examplatform.repository.TestRepository;
import com.examplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class AccountService {

    private final UserRepository userRepository;
    private final OtpCodeRepository otpCodeRepository;
    private final QuizResultRepository quizResultRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;

    public AccountService(UserRepository userRepository,
                          OtpCodeRepository otpCodeRepository,
                          QuizResultRepository quizResultRepository,
                          TestRepository testRepository,
                          QuestionRepository questionRepository,
                          SubjectRepository subjectRepository) {
        this.userRepository = userRepository;
        this.otpCodeRepository = otpCodeRepository;
        this.quizResultRepository = quizResultRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
        this.subjectRepository = subjectRepository;
    }

    public void deleteAccountByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Invalid authenticated user");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String email = normalize(user.getEmail());

        // Remove OTP records tied to the account email.
        if (!email.isBlank()) {
            otpCodeRepository.deleteByEmail(email);
        }

        // Remove all attempt history for this user.
        quizResultRepository.deleteByUserId(userId);

        // Remove teacher-owned resources and related references.
        List<Test> ownedTests = email.isBlank()
                ? List.of()
                : testRepository.findByCreatedByIgnoreCase(email);

        Set<String> ownedTestIds = new LinkedHashSet<>();
        for (Test test : ownedTests) {
            if (test != null && test.getId() != null && !test.getId().isBlank()) {
                ownedTestIds.add(test.getId());
            }
        }

        if (!ownedTestIds.isEmpty()) {
            for (String testId : ownedTestIds) {
                questionRepository.deleteByTestId(testId);
            }

            quizResultRepository.deleteByTestIdIn(new ArrayList<>(ownedTestIds));
            testRepository.deleteAllById(ownedTestIds);
        }

        // Remove teacher-owned subjects after tests cleanup to avoid dangling references.
        if (!email.isBlank()) {
            List<Subject> ownedSubjects = subjectRepository.findByCreatedByIgnoreCase(email);
            if (ownedSubjects != null && !ownedSubjects.isEmpty()) {
                subjectRepository.deleteAll(ownedSubjects);
            }
        }

        userRepository.deleteById(userId);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
