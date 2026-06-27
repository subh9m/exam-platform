package com.examplatform.collab.controller;

import com.examplatform.collab.dto.*;
import com.examplatform.collab.model.CollabRoom;
import com.examplatform.collab.service.CollabRoomService;
import com.examplatform.model.User;
import com.examplatform.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class CollabWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(CollabWebSocketController.class);

    private final CollabRoomService collabRoomService;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    public CollabWebSocketController(CollabRoomService collabRoomService,
                                     UserService userService,
                                     SimpMessagingTemplate messagingTemplate) {
        this.collabRoomService = collabRoomService;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    private User getUser(Principal principal) {
        if (principal == null) return null;
        String userId = principal.getName();
        return userService.findById(userId);
    }

    @MessageMapping("/room/{roomCode}/join")
    public void handleJoin(@DestinationVariable String roomCode, Principal principal) {
        User user = getUser(principal);
        if (user == null) return;

        CollabRoom room = collabRoomService.getRoomByCode(roomCode).orElse(null);
        if (room == null) return;

        log.info("WebSocket user-joined: {} in room {}", user.getUsername(), roomCode);

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/presence",
                PresenceMessage.builder()
                        .roomCode(roomCode)
                        .participantUsernames(room.getParticipantUsernames())
                        .joinedUser(user.getUsername())
                        .build()
        );
    }

    @MessageMapping("/room/{roomCode}/code-update")
    public void handleCodeUpdate(@DestinationVariable String roomCode, CodeUpdateMessage message, Principal principal) {
        User user = getUser(principal);
        if (user == null) return;

        message.setSenderUsername(user.getUsername());
        
        // Broadcast code changes to other users in the room
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/code-update", message);

        // Auto-save the full code if provided
        if (message.getFullCode() != null) {
            collabRoomService.updateCode(roomCode, message.getFullCode());
        }
    }

    @MessageMapping("/room/{roomCode}/yjs")
    public void handleYjsMessage(@DestinationVariable String roomCode, com.examplatform.collab.dto.YjsMessage message, Principal principal) {
        User user = getUser(principal);
        if (user == null) return;

        message.setSenderUsername(user.getUsername());
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/yjs", message);
    }

    @MessageMapping("/room/{roomCode}/cursor-update")
    public void handleCursorUpdate(@DestinationVariable String roomCode, CursorUpdateMessage message, Principal principal) {
        User user = getUser(principal);
        if (user == null) return;

        message.setSenderUsername(user.getUsername());
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/cursor-update", message);
    }

    @MessageMapping("/room/{roomCode}/language-update")
    public void handleLanguageUpdate(@DestinationVariable String roomCode, Map<String, String> payload, Principal principal) {
        User user = getUser(principal);
        if (user == null) return;

        String language = payload.get("language");
        if (language == null) return;

        collabRoomService.updateLanguage(roomCode, language);

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/language-update", payload);
    }

    @MessageMapping("/room/{roomCode}/typing")
    public void handleTyping(@DestinationVariable String roomCode, TypingMessage message, Principal principal) {
        User user = getUser(principal);
        if (user == null) return;

        message.setSenderUsername(user.getUsername());
        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/typing", message);
    }

    @MessageMapping("/room/{roomCode}/leave")
    public void handleLeave(@DestinationVariable String roomCode, Principal principal) {
        User user = getUser(principal);
        if (user == null) return;

        CollabRoom room = collabRoomService.leaveRoom(roomCode, user.getUsername());
        List<String> activeUsers = room != null ? room.getParticipantUsernames() : new ArrayList<>();

        messagingTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/presence",
                PresenceMessage.builder()
                        .roomCode(roomCode)
                        .participantUsernames(activeUsers)
                        .leftUser(user.getUsername())
                        .build()
        );
    }
}
