package com.examplatform.collab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceMessage {
    private String roomCode;
    private List<String> participantUsernames;
    private int activeParticipantCount;
    private int maxParticipants;
    private String joinedUser;
    private String leftUser;
    private String type; // "join" or "leave"
}
