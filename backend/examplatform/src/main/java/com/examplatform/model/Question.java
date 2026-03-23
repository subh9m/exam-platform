package com.examplatform.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "questions")
public class Question {

    @Id
    private String id;
    private String subject;
    private String testId;
    private String createdBy;
    private String type; // MCQ or TEXT
    private String questionText;
    private List<String> options;
    private String correctAnswer; // option text
    private String explanation;

    public Question() {}

    public Question(String subject, String testId, String createdBy, String type, String questionText, List<String> options, String correctAnswer, String explanation) {
        this.subject = subject;
        this.testId = testId;
        this.createdBy = createdBy;
        this.type = type;
        this.questionText = questionText;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.explanation = explanation;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
