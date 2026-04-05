package com.examplatform.config;

import com.examplatform.model.Subject;
import com.examplatform.model.Test;
import com.examplatform.repository.SubjectRepository;
import com.examplatform.repository.TestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String SYSTEM_USER = "System";

    private final SubjectRepository subjectRepository;
    private final TestRepository testRepository;

    public DataSeeder(SubjectRepository subjectRepository, TestRepository testRepository) {
        this.subjectRepository = subjectRepository;
        this.testRepository = testRepository;
    }

    @Override
    public void run(String... args) {
        Map<String, String> defaultSubjects = new LinkedHashMap<>();
        defaultSubjects.put("DSA", "Data structures, algorithms, and complexity fundamentals.");
        defaultSubjects.put("DBMS", "Database concepts, SQL, indexing, and normalization.");
        defaultSubjects.put("OS", "Operating systems, scheduling, memory, and processes.");
        defaultSubjects.put("CN", "Computer networks, protocols, routing, and transport.");
        defaultSubjects.put("OOP", "Object-oriented programming principles and design.");
        defaultSubjects.put("JAVA", "Core Java language and standard library basics.");
        defaultSubjects.put("COA", "Computer organization, instruction cycles, and architecture.");
        defaultSubjects.put("AI", "Artificial intelligence basics, search, and learning methods.");
        defaultSubjects.put("SE", "Software engineering process, models, testing, and quality.");

        for (Map.Entry<String, String> subjectEntry : defaultSubjects.entrySet()) {
            String subjectName = subjectEntry.getKey();
            String subjectDescription = subjectEntry.getValue();
            Subject subject = seedSubject(subjectName, subjectDescription);
            seedDefaultTestForSubject(subject);
        }
    }

    private Subject seedSubject(String name, String description) {
        return subjectRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Subject subject = new Subject();
            subject.setName(name);
            subject.setDescription(description);
            subject.setCreatedBy(SYSTEM_USER);
            subject.setCreatedAt(new Date());
            return subjectRepository.save(subject);
        });
    }

    private void seedDefaultTestForSubject(Subject subject) {
        if (subject == null || subject.getName() == null) {
            return;
        }

        String normalizedSubject = subject.getName().trim().toLowerCase();
        String testName = subject.getName().trim() + " Question Pool";

        if (testRepository.existsBySubjectAndTestNameIgnoreCase(normalizedSubject, testName)) {
            return;
        }

        Test test = new Test();
        test.setSubject(normalizedSubject);
        test.setTestName(testName);
        test.setCreatedBy(SYSTEM_USER);
        test.setCreatedAt(new Date());
        testRepository.save(test);
    }
}
