package com.examplatform.service;

import com.examplatform.model.Question;
import com.examplatform.model.QuizResult;
import com.examplatform.model.Test;
import com.examplatform.model.User;
import com.examplatform.repository.QuestionRepository;
import com.examplatform.repository.QuizResultRepository;
import com.examplatform.repository.TestRepository;
import com.examplatform.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class QuizService {

    private static final Logger log = LoggerFactory.getLogger(QuizService.class);
    private static final String SYSTEM_OWNER = "System";

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestRepository testRepository;


    // ✅ Fetch quiz attempt history for a user
    public List<QuizResult> getHistory(String userId) {
        return quizResultRepository.findByUserIdOrderByDateTakenDesc(userId);
    }

    public QuizResult getAttemptDetail(String attemptId) {
        return quizResultRepository.findById(attemptId).orElse(null);
    }

    public Test createTest(String subject, String testName, String createdBy) {
        if (subject == null || subject.isBlank()) {
            throw new RuntimeException("Subject is required");
        }
        if (testName == null || testName.isBlank()) {
            throw new RuntimeException("Test name is required");
        }

        Test test = new Test();
        test.setSubject(subject.trim().toLowerCase());
        test.setTestName(testName.trim());
        test.setCreatedBy(createdBy);
        test.setCreatedAt(new Date());
        return testRepository.save(test);
    }

    public Question addQuestionToTest(String testId, String type, String questionText, List<String> options, String correctAnswer, String explanation, String createdBy) {
        if (testId == null || testId.isBlank()) {
            throw new RuntimeException("testId is required");
        }
        if (type == null || type.isBlank()) {
            throw new RuntimeException("type is required");
        }
        if (questionText == null || questionText.isBlank()) {
            throw new RuntimeException("questionText is required");
        }
        if (correctAnswer == null || correctAnswer.isBlank()) {
            throw new RuntimeException("correctAnswer is required");
        }

        String normalizedType = type.trim().toUpperCase();
        if (!"MCQ".equals(normalizedType) && !"TEXT".equals(normalizedType)) {
            throw new RuntimeException("type must be MCQ or TEXT");
        }

        if ("MCQ".equals(normalizedType)) {
            if (options == null || options.size() != 4) {
                throw new RuntimeException("Exactly 4 options are required for MCQ");
            }
        } else {
            options = List.of();
        }

        Test test = testRepository.findById(testId).orElseThrow(() -> new RuntimeException("Test not found"));

        String testOwner = test.getCreatedBy() == null ? "" : test.getCreatedBy().trim();
        boolean ownTest = createdBy.equalsIgnoreCase(testOwner);
        boolean systemTest = SYSTEM_OWNER.equalsIgnoreCase(testOwner);
        if (!ownTest && !systemTest) {
            throw new IllegalStateException("You can only modify your own tests or system tests");
        }

        Question q = new Question();
        q.setSubject(test.getSubject());
        q.setTestId(testId);
        q.setCreatedBy(createdBy);
        q.setType(normalizedType);
        q.setQuestionText(questionText.trim());
        q.setOptions(options);
        q.setCorrectAnswer(correctAnswer.trim());
        q.setExplanation(explanation == null ? null : explanation.trim());
        return questionRepository.save(q);
    }

    public void deleteTestForTeacher(String testId, String teacherEmail) {
        if (testId == null || testId.isBlank()) {
            throw new IllegalArgumentException("testId is required");
        }

        Test test = testRepository.findById(testId).orElseThrow(() -> new NoSuchElementException("Test not found"));
        if (!teacherEmail.equalsIgnoreCase(test.getCreatedBy())) {
            throw new IllegalStateException("You can only delete your own tests");
        }

        questionRepository.deleteByTestId(testId);
        testRepository.deleteById(testId);
    }

    public void deleteQuestionForTeacher(String questionId, String teacherEmail) {
        if (questionId == null || questionId.isBlank()) {
            throw new IllegalArgumentException("questionId is required");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new NoSuchElementException("Question not found"));

        Test test = testRepository.findById(question.getTestId())
                .orElseThrow(() -> new NoSuchElementException("Test not found for this question"));

        String questionOwner = question.getCreatedBy() == null ? "" : question.getCreatedBy().trim();
        String testOwner = test.getCreatedBy() == null ? "" : test.getCreatedBy().trim();

        if (SYSTEM_OWNER.equalsIgnoreCase(questionOwner) || SYSTEM_OWNER.equalsIgnoreCase(testOwner)) {
            if (!teacherEmail.equalsIgnoreCase(questionOwner)) {
                throw new IllegalStateException("System questions cannot be deleted");
            }
        }

        boolean ownQuestion = teacherEmail.equalsIgnoreCase(questionOwner);
        boolean legacyOwnTestQuestion = questionOwner.isBlank() && teacherEmail.equalsIgnoreCase(testOwner);
        if (!ownQuestion && !legacyOwnTestQuestion) {
            throw new IllegalStateException("You can only delete questions that you added");
        }

        questionRepository.deleteById(questionId);
    }

    public Question updateQuestionForTeacher(
            String questionId,
            String type,
            String questionText,
            List<String> options,
            String correctAnswer,
            String explanation,
            String teacherEmail
    ) {
        if (questionId == null || questionId.isBlank()) {
            throw new IllegalArgumentException("questionId is required");
        }

        Question existing = questionRepository.findById(questionId)
                .orElseThrow(() -> new NoSuchElementException("Question not found"));

        Test test = testRepository.findById(existing.getTestId())
                .orElseThrow(() -> new NoSuchElementException("Test not found for this question"));

        String questionOwner = existing.getCreatedBy() == null ? "" : existing.getCreatedBy().trim();
        String testOwner = test.getCreatedBy() == null ? "" : test.getCreatedBy().trim();

        if (SYSTEM_OWNER.equalsIgnoreCase(questionOwner) || SYSTEM_OWNER.equalsIgnoreCase(testOwner)) {
            if (!teacherEmail.equalsIgnoreCase(questionOwner)) {
                throw new IllegalStateException("System questions cannot be updated");
            }
        }

        boolean ownQuestion = teacherEmail.equalsIgnoreCase(questionOwner);
        boolean legacyOwnTestQuestion = questionOwner.isBlank() && teacherEmail.equalsIgnoreCase(testOwner);
        if (!ownQuestion && !legacyOwnTestQuestion) {
            throw new IllegalStateException("You can only update questions that you added");
        }

        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("type is required");
        }
        if (questionText == null || questionText.isBlank()) {
            throw new IllegalArgumentException("questionText is required");
        }
        if (correctAnswer == null || correctAnswer.isBlank()) {
            throw new IllegalArgumentException("correctAnswer is required");
        }

        String normalizedType = type.trim().toUpperCase();
        if (!"MCQ".equals(normalizedType) && !"TEXT".equals(normalizedType)) {
            throw new IllegalArgumentException("type must be MCQ or TEXT");
        }

        if ("MCQ".equals(normalizedType)) {
            if (options == null || options.size() != 4) {
                throw new IllegalArgumentException("Exactly 4 options are required for MCQ");
            }
        } else {
            options = List.of();
        }

        existing.setType(normalizedType);
        existing.setQuestionText(questionText.trim());
        existing.setOptions(options);
        existing.setCorrectAnswer(correctAnswer.trim());
        existing.setExplanation(explanation == null ? null : explanation.trim());
        existing.setSubject(test.getSubject());
        existing.setCreatedBy(questionOwner.isBlank() ? teacherEmail : questionOwner);
        return questionRepository.save(existing);
    }

    public List<Test> getTestsBySubject(String subject) {
        return testRepository.findBySubject(subject.toLowerCase());
    }

    public List<Test> getTestsByTeacher(String createdBy) {
        return testRepository.findByCreatedBy(createdBy);
    }

    public Test getTestById(String testId) {
        return testRepository.findById(testId)
                .orElseThrow(() -> new NoSuchElementException("Test not found"));
    }

    public List<Question> getQuestionsByTestId(String testId) {
        List<Question> questions = questionRepository.findByTestId(testId);
        Collections.shuffle(questions);
        return questions;
    }

    public List<Question> getQuestionsByTestIdForTeacher(String testId) {
        if (testId == null || testId.isBlank()) {
            throw new IllegalArgumentException("testId is required");
        }
        return questionRepository.findByTestId(testId);
    }


    // ✅ Submit quiz and save record
    public int submitQuiz(String userId, String subject, Map<String, String> answers) {
        throw new RuntimeException("testId is required for quiz submission");
    }

    public int submitQuizDynamic(String userId, String subject, Map<String, String> answers, List<Map<String, Object>> selectedQuestions) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User not authenticated");
        }
        if (selectedQuestions == null || selectedQuestions.isEmpty()) {
            throw new IllegalArgumentException("No questions submitted");
        }
        if (answers == null) {
            throw new IllegalArgumentException("Invalid answers format");
        }

        log.info("submitQuizDynamic userId={}, subject={}, questions={}, answers={}",
                userId, subject, selectedQuestions.size(), answers.size());

        int scoreCount = 0;
        for (Map<String, Object> question : selectedQuestions) {
            String questionId = asString(question.get("id"));
            String questionText = asString(question.get("questionText"));
            String correctAnswer = asString(question.get("correctAnswer"));
            String selected = answers.get(questionId);

            // Backward-compatible answer format fallback: answers keyed by question text.
            if ((selected == null || selected.isBlank()) && !questionText.isBlank()) {
                selected = answers.get(questionText);
            }

            if (selected != null && !correctAnswer.isBlank() && selected.trim().equalsIgnoreCase(correctAnswer.trim())) {
                scoreCount++;
            }
        }

        QuizResult result = new QuizResult();
        result.setUserId(userId);
        result.setSubject(subject);
        result.setTestId(null);
        result.setTestName((subject == null ? "Subject" : subject.toUpperCase()) + " Pool");
        result.setScore(scoreCount);
        result.setTotalQuestions(selectedQuestions.size());
        result.setAnswers(answers);
        result.setQuestionSnapshot(buildSnapshotFromSubmittedQuestions(selectedQuestions));
        result.setDateTaken(new Date());
        quizResultRepository.save(result);

        final int finalScore = scoreCount;
        userRepository.findById(userId).ifPresent(user -> {
            user.setTotalScore(user.getTotalScore() + finalScore);
            userRepository.save(user);
        });

        return scoreCount;
    }

    public int submitQuiz(String userId, String subject, String testId, Map<String, String> answers) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User not authenticated");
        }
        if (testId == null || testId.isBlank()) {
            throw new IllegalArgumentException("testId is required for quiz submission");
        }
        if (answers == null) {
            throw new IllegalArgumentException("Invalid answers format");
        }

        List<Question> questions = questionRepository.findByTestId(testId);
        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException("No questions submitted");
        }

        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found"));

        log.info("submitQuiz userId={}, testId={}, answers={}, questions={}",
                userId, testId, answers.size(), questions.size());

        subject = test.getSubject();
        int scoreCount = 0;

        for (Question q : questions) {
            String questionId = q == null ? "" : asString(q.getId());
            String questionText = q == null ? "" : asString(q.getQuestionText());
            String selected = answers.get(questionId);

            if ((selected == null || selected.isBlank()) && !questionText.isBlank()) {
                selected = answers.get(questionText);
            }

            String correct = q == null ? "" : asString(q.getCorrectAnswer());
            if (selected != null && !correct.isBlank() && selected.trim().equalsIgnoreCase(correct.trim())) {
                scoreCount++;
            }
        }

        // ✅ Save result
        QuizResult result = new QuizResult();
        result.setUserId(userId);
        result.setSubject(subject);
        result.setTestId(testId);
        result.setTestName(test == null ? null : test.getTestName());
        result.setScore(scoreCount);
        result.setTotalQuestions(questions.size());
        result.setAnswers(answers);
        result.setQuestionSnapshot(buildSnapshotFromQuestions(questions));
        result.setDateTaken(new Date());
        quizResultRepository.save(result);

        // ✅ Store score in a final variable for lambda
        final int finalScore = scoreCount;

        userRepository.findById(userId).ifPresent(user -> {
            user.setTotalScore(user.getTotalScore() + finalScore);
            userRepository.save(user);
        });

        return scoreCount;
    }


    // ✅ Leaderboard
    public List<Map<String, Object>> getLeaderboard() {
        return getLeaderboardByTest(null);
    }

    public List<Map<String, Object>> getLeaderboardByTest(String testId) {
        List<QuizResult> results;
        if (testId == null || testId.isBlank()) {
            results = quizResultRepository.findAll();
        } else {
            results = quizResultRepository.findByTestId(testId);
        }

        Map<String, Integer> scoreByUser = new HashMap<>();
        for (QuizResult result : results) {
            scoreByUser.merge(result.getUserId(), result.getScore(), Integer::sum);
        }

        List<User> users = userRepository.findAll();
        users.sort((a, b) -> Integer.compare(
                scoreByUser.getOrDefault(b.getId(), 0),
                scoreByUser.getOrDefault(a.getId(), 0)
        ));

        List<Map<String, Object>> leaderboard = new ArrayList<>();
        for (User u : users.stream().limit(10).toList()) {
            int totalScore = scoreByUser.getOrDefault(u.getId(), 0);
            if (totalScore == 0 && !scoreByUser.containsKey(u.getId())) {
                continue;
            }

            Map<String, Object> entry = new HashMap<>();
            entry.put("userId", u.getId());
            entry.put("username", u.getUsername());
            entry.put("totalScore", totalScore);
            leaderboard.add(entry);
        }
        return leaderboard;
    }

    public List<Map<String, Object>> getTeacherResults(String teacherEmail) {
        List<Test> tests = testRepository.findAll();
        List<QuizResult> results = quizResultRepository.findAll();

        Map<String, User> usersById = new HashMap<>();
        for (User u : userRepository.findAll()) {
            usersById.put(u.getId(), u);
        }

        Map<String, Test> testsById = new HashMap<>();
        for (Test t : tests) {
            testsById.put(t.getId(), t);
        }

        List<Map<String, Object>> payload = new ArrayList<>();
        for (QuizResult r : results) {
            Map<String, Object> row = new HashMap<>();
            User student = usersById.get(r.getUserId());
            Test test = testsById.get(r.getTestId());

            row.put("attemptId", r.getId());
            row.put("studentId", r.getUserId());
            row.put("studentEmail", student == null ? "Unknown" : student.getEmail());
            row.put("studentName", student == null ? "Unknown" : student.getUsername());
            row.put("subject", r.getSubject());
            row.put("testId", r.getTestId());
            row.put("testName", test == null ? r.getTestName() : test.getTestName());
            row.put("score", r.getScore());
            row.put("totalQuestions", r.getTotalQuestions());
            row.put("answers", r.getAnswers());
            row.put("dateTaken", r.getDateTaken());
            payload.add(row);
        }

        payload.sort((a, b) -> ((Date) b.get("dateTaken")).compareTo((Date) a.get("dateTaken")));
        return payload;
    }

    private List<Map<String, Object>> buildSnapshotFromQuestions(List<Question> questions) {
        List<Map<String, Object>> snapshot = new ArrayList<>();
        for (Question question : questions) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", question.getId());
            row.put("questionText", question.getQuestionText());
            row.put("correctAnswer", question.getCorrectAnswer());
            row.put("options", question.getOptions());
            snapshot.add(row);
        }
        return snapshot;
    }

    private List<Map<String, Object>> buildSnapshotFromSubmittedQuestions(List<Map<String, Object>> selectedQuestions) {
        List<Map<String, Object>> snapshot = new ArrayList<>();
        for (Map<String, Object> question : selectedQuestions) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", asString(question.get("id")));
            row.put("questionText", asString(question.get("questionText")));
            row.put("correctAnswer", asString(question.get("correctAnswer")));

            Object options = question.get("options");
            if (options instanceof List<?>) {
                row.put("options", new ArrayList<>((List<?>) options));
            } else {
                row.put("options", List.of());
            }

            snapshot.add(row);
        }
        return snapshot;
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }
}
