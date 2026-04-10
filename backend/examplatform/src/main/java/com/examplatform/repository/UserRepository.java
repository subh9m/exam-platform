package com.examplatform.repository;

import com.examplatform.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    User findByEmailIgnoreCase(String email);
    List<User> findAllByEmailIgnoreCase(String email);
    User findByGoogleId(String googleId);
}
