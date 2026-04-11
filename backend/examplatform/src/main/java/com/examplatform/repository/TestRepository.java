package com.examplatform.repository;

import com.examplatform.model.Test;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TestRepository extends MongoRepository<Test, String> {
    List<Test> findBySubject(String subject);
    List<Test> findByCreatedBy(String createdBy);
    List<Test> findByCreatedByIgnoreCase(String createdBy);
    List<Test> findByCreatedByIn(List<String> createdBy);
    boolean existsBySubjectAndTestNameIgnoreCase(String subject, String testName);
}
