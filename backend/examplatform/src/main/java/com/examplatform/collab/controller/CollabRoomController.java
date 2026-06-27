package com.examplatform.collab.controller;

import com.examplatform.collab.dto.CollabRoomResponse;
import com.examplatform.collab.model.CollabRoom;
import com.examplatform.collab.service.CollabRoomService;
import com.examplatform.model.User;
import com.examplatform.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/collab")
public class CollabRoomController {

    private final CollabRoomService collabRoomService;
    private final UserService userService;

    public CollabRoomController(CollabRoomService collabRoomService, UserService userService) {
        this.collabRoomService = collabRoomService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal == null) {
            throw new IllegalStateException("Not authenticated");
        }
        String userId = principal.toString();
        User user = userService.findById(userId);
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        return user;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createRoom() {
        try {
            User user = getAuthenticatedUser();
            CollabRoom room = collabRoomService.createRoom(user.getId(), user.getUsername());
            return ResponseEntity.ok(toResponse(room));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    @PostMapping("/join/{roomCode}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomCode) {
        try {
            User user = getAuthenticatedUser();
            CollabRoom room = collabRoomService.joinRoom(roomCode, user.getId(), user.getUsername());
            return ResponseEntity.ok(toResponse(room));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", "Could not join room"));
        }
    }

    @GetMapping("/room/{roomCode}")
    public ResponseEntity<?> getRoom(@PathVariable String roomCode) {
        try {
            User user = getAuthenticatedUser();
            CollabRoom room = collabRoomService.getRoomByCode(roomCode)
                    .orElseThrow(() -> new IllegalArgumentException("Room not found"));

            if (!room.getParticipantUsernames().contains(user.getUsername())) {
                return ResponseEntity.status(403).body(Map.of("message", "Access denied. You are not a participant in this room."));
            }

            return ResponseEntity.ok(toResponse(room));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("message", ex.getMessage()));
        }
    }

    private CollabRoomResponse toResponse(CollabRoom room) {
        return CollabRoomResponse.builder()
                .id(room.getId())
                .roomCode(room.getRoomCode())
                .creatorId(room.getCreatorId())
                .participantUsernames(room.getParticipantUsernames())
                .code(room.getCode())
                .language(room.getLanguage())
                .createdAt(room.getCreatedAt())
                .lastActivityTime(room.getLastActivityTime())
                .build();
    }
}
