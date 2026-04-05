package com.examplatform.repository;

import com.examplatform.model.OtpCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface OtpCodeRepository extends MongoRepository<OtpCode, String> {

    // Fetch latest OTP for verification
    Optional<OtpCode> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);

    long countByEmailAndCreatedAtAfter(String email, Instant createdAt);
}
