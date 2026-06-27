package com.examplatform.collab.service;

import com.examplatform.collab.config.CollabProperties;
import com.examplatform.collab.model.CollabRoom;
import com.examplatform.collab.repository.CollabRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class CollabRoomService {

    private static final Logger log = LoggerFactory.getLogger(CollabRoomService.class);
    
    private final CollabRoomRepository roomRepository;
    private final CollabProperties collabProperties;
    private final SecureRandom random = new SecureRandom();
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 4;
    private static final long INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    public CollabRoomService(CollabRoomRepository roomRepository, CollabProperties collabProperties) {
        this.roomRepository = roomRepository;
        this.collabProperties = collabProperties;
    }

    public int getMaxParticipants() {
        return collabProperties.getMaxParticipants();
    }

    public CollabRoom createRoom(String creatorId, String creatorUsername) {
        String roomCode = generateUniqueCode();
        
        List<String> participants = new ArrayList<>();
        participants.add(creatorUsername);

        CollabRoom room = CollabRoom.builder()
                .roomCode(roomCode)
                .creatorId(creatorId)
                .creatorUsername(creatorUsername)
                .participantUsernames(participants)
                .code("// Welcome to Collab Code!\n// Start coding here...\n")
                .language("javascript")
                .createdAt(new Date())
                .lastActivityTime(new Date())
                .build();

        CollabRoom saved = roomRepository.save(room);
        log.info("Created CollabRoom code: {} by user ID: {}", roomCode, creatorId);
        return saved;
    }

    public CollabRoom joinRoom(String roomCode, String userId, String username) {
        CollabRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));

        // If the user is already in the room, allow rejoin/reconnection
        if (room.getParticipantUsernames().contains(username)) {
            room.setLastActivityTime(new Date());
            return roomRepository.save(room);
        }

        // If the room has reached the configured max, reject
        int max = collabProperties.getMaxParticipants();
        if (room.getParticipantUsernames().size() >= max) {
            throw new IllegalStateException("Room is full (max " + max + " participants)");
        }

        room.getParticipantUsernames().add(username);
        room.setLastActivityTime(new Date());
        CollabRoom updated = roomRepository.save(room);
        log.info("User {} joined CollabRoom code: {}", username, roomCode);
        return updated;
    }

    public Optional<CollabRoom> getRoomByCode(String roomCode) {
        return roomRepository.findByRoomCode(roomCode.trim().toUpperCase());
    }

    public CollabRoom updateCode(String roomCode, String code) {
        CollabRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        room.setCode(code);
        room.setLastActivityTime(new Date());
        return roomRepository.save(room);
    }

    public CollabRoom updateLanguage(String roomCode, String language) {
        CollabRoom room = roomRepository.findByRoomCode(roomCode.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        room.setLanguage(language);
        room.setLastActivityTime(new Date());
        return roomRepository.save(room);
    }

    public CollabRoom leaveRoom(String roomCode, String username) {
        Optional<CollabRoom> roomOpt = roomRepository.findByRoomCode(roomCode.trim().toUpperCase());
        if (roomOpt.isPresent()) {
            CollabRoom room = roomOpt.get();
            room.getParticipantUsernames().remove(username);
            room.setLastActivityTime(new Date());
            
            // If the room is now empty, delete it
            if (room.getParticipantUsernames().isEmpty()) {
                roomRepository.delete(room);
                log.info("Deleted empty CollabRoom code: {}", roomCode);
                return null;
            } else {
                CollabRoom saved = roomRepository.save(room);
                log.info("User {} left CollabRoom code: {}", username, roomCode);
                return saved;
            }
        }
        return null;
    }

    /**
     * Find all rooms where a given username is a participant.
     * Used by the WebSocket disconnect listener to clean up ghost users.
     */
    public List<CollabRoom> findRoomsByParticipant(String username) {
        return roomRepository.findByParticipantUsernamesContaining(username);
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    public void cleanupInactiveRooms() {
        Date cutoff = new Date(System.currentTimeMillis() - INACTIVITY_TIMEOUT_MS);
        List<CollabRoom> expiredRooms = roomRepository.findByLastActivityTimeBefore(cutoff);
        if (!expiredRooms.isEmpty()) {
            roomRepository.deleteAll(expiredRooms);
            log.info("Cleaned up {} inactive CollabRooms", expiredRooms.size());
        }
    }

    private String generateUniqueCode() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        do {
            code.setLength(0);
            for (int i = 0; i < CODE_LENGTH; i++) {
                code.append(CODE_CHARS.charAt(random.nextInt(CODE_CHARS.length())));
            }
        } while (roomRepository.existsByRoomCode(code.toString()));
        return code.toString();
    }
}
