package com.examplatform.service;

import com.examplatform.model.Subject;
import com.examplatform.model.Test;
import com.examplatform.repository.QuestionRepository;
import com.examplatform.repository.SubjectRepository;
import com.examplatform.repository.TestRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;

    public SubjectService(SubjectRepository subjectRepository, TestRepository testRepository, QuestionRepository questionRepository) {
        this.subjectRepository = subjectRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll()
                .stream()
                .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
                .toList();
    }

    public Subject createSubject(String name, String description, String createdBy) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Subject name is required");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Subject description is required");
        }

        String normalizedName = name.trim();
        if (subjectRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new IllegalStateException("A subject with this name already exists");
        }

        Subject subject = new Subject();
        subject.setName(normalizedName);
        subject.setDescription(description.trim());
        subject.setCreatedBy(createdBy == null || createdBy.isBlank() ? "System" : createdBy.trim());
        subject.setCreatedAt(new Date());

        return subjectRepository.save(subject);
    }

    public void deleteSubjectForTeacher(String subjectId, String teacherEmail) {
        if (subjectId == null || subjectId.isBlank()) {
            throw new IllegalArgumentException("subjectId is required");
        }

        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        if (subject.getCreatedBy() == null || !subject.getCreatedBy().equalsIgnoreCase(teacherEmail)) {
            throw new IllegalStateException("You can only delete your own subjects");
        }

        String normalizedSubject = (subject.getName() == null ? "" : subject.getName().trim().toLowerCase());
        List<Test> tests = testRepository.findBySubject(normalizedSubject);

        for (Test test : tests) {
            if (test.getId() != null) {
                questionRepository.deleteByTestId(test.getId());
            }
        }

        testRepository.deleteAll(tests);
        subjectRepository.deleteById(subjectId);
    }
}
