package com.examplatform.service;

import com.examplatform.model.Subject;
import com.examplatform.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
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
}
