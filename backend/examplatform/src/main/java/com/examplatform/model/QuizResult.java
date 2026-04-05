package com.examplatform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Document(collection = "quiz_results")
public class QuizResult {

    @Id
    private String id;

    private String userId;
    private String subject;
    private String testId;
    private String testName;
    private int score;
    private int totalQuestions;  // ✅ NEW
    private Map<String, String> answers; // ✅ NEW
    private List<Map<String, Object>> questionSnapshot;
    private Date dateTaken;

    public QuizResult() {}

    public QuizResult(String userId, String subject, String testId, String testName, int score, int totalQuestions, Map<String, String> answers, List<Map<String, Object>> questionSnapshot, Date dateTaken) {
        this.userId = userId;
        this.subject = subject;
        this.testId = testId;
        this.testName = testName;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.answers = answers;
        this.questionSnapshot = questionSnapshot;
        this.dateTaken = dateTaken;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public Map<String, String> getAnswers() { return answers; }
    public void setAnswers(Map<String, String> answers) { this.answers = answers; }

    public List<Map<String, Object>> getQuestionSnapshot() { return questionSnapshot; }
    public void setQuestionSnapshot(List<Map<String, Object>> questionSnapshot) { this.questionSnapshot = questionSnapshot; }

    public Date getDateTaken() { return dateTaken; }
    public void setDateTaken(Date dateTaken) { this.dateTaken = dateTaken; }
}
