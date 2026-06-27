package com.examplatform.collab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YjsMessage {
    private String roomCode;
    private String senderUsername;
    private String type; // "sync-step-1", "sync-step-2", "update"
    private String payload; // Base64 encoded Yjs update
}
