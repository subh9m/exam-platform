package com.examplatform.repository;

import com.examplatform.model.Subject;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface SubjectRepository extends MongoRepository<Subject, String> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Subject> findByNameIgnoreCase(String name);
}
