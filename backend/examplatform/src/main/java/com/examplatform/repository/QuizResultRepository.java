package com.examplatform.repository;

import com.examplatform.model.QuizResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QuizResultRepository extends MongoRepository<QuizResult, String> {
    List<QuizResult> findByUserIdOrderByDateTakenDesc(String userId);
    List<QuizResult> findByTestId(String testId);
    List<QuizResult> findByTestIdIn(List<String> testIds);
    void deleteByUserId(String userId);
    void deleteByTestIdIn(List<String> testIds);
}
