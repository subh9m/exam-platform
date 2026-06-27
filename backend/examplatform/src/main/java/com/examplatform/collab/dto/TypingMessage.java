package com.examplatform.collab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TypingMessage {
    private String roomCode;
    private String senderUsername;
    private boolean typing;
}
