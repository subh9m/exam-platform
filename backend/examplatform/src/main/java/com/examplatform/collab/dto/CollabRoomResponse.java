package com.examplatform.collab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollabRoomResponse {
    private String id;
    private String roomCode;
    private String creatorId;
    private List<String> participantUsernames;
    private String code;
    private String language;
    private Date createdAt;
    private Date lastActivityTime;
}
