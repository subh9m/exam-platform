package com.examplatform.repository;

import com.examplatform.model.OtpCode;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpCodeRepository extends MongoRepository<OtpCode, String> {

    // Delete old OTPs when issuing new one
    void deleteByEmailAndPurpose(String email, String purpose);

    // Fetch latest OTP for verification
    Optional<OtpCode> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);
}
