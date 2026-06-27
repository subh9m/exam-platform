package com.examplatform.collab.config;

import com.examplatform.collab.dto.PresenceMessage;
import com.examplatform.collab.model.CollabRoom;
import com.examplatform.collab.service.CollabRoomService;
import com.examplatform.model.User;
import com.examplatform.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

/**
 * Listens for WebSocket session disconnect events (browser close, refresh, network failure)
 * and removes the disconnected user from any active collab rooms to prevent ghost users.
 */
@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final CollabRoomService collabRoomService;
    private final CollabProperties collabProperties;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(CollabRoomService collabRoomService,
                                  CollabProperties collabProperties,
                                  UserService userService,
                                  SimpMessagingTemplate messagingTemplate) {
        this.collabRoomService = collabRoomService;
        this.collabProperties = collabProperties;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        Principal principal = event.getUser();
        if (principal == null) return;

        String userId = principal.getName();
        User user = userService.findById(userId);
        if (user == null) return;

        String username = user.getUsername();
        log.info("WebSocket disconnect detected for user: {}", username);

        // Find all rooms where this user is a participant
        List<CollabRoom> rooms = collabRoomService.findRoomsByParticipant(username);

        for (CollabRoom room : rooms) {
            String roomCode = room.getRoomCode();
            CollabRoom updatedRoom = collabRoomService.leaveRoom(roomCode, username);
            List<String> activeUsers = updatedRoom != null ? updatedRoom.getParticipantUsernames() : new ArrayList<>();

            messagingTemplate.convertAndSend(
                    "/topic/room/" + roomCode + "/presence",
                    PresenceMessage.builder()
                            .roomCode(roomCode)
                            .participantUsernames(activeUsers)
                            .activeParticipantCount(activeUsers.size())
                            .maxParticipants(collabProperties.getMaxParticipants())
                            .leftUser(username)
                            .type("leave")
                            .build()
            );

            log.info("Removed disconnected user {} from room {}", username, roomCode);
        }
    }
}
