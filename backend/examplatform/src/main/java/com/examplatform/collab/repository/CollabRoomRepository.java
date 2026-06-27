package com.examplatform.collab.repository;

import com.examplatform.collab.model.CollabRoom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface CollabRoomRepository extends MongoRepository<CollabRoom, String> {
    Optional<CollabRoom> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);
    List<CollabRoom> findByLastActivityTimeBefore(Date timeout);
    List<CollabRoom> findByParticipantUsernamesContaining(String username);
}
