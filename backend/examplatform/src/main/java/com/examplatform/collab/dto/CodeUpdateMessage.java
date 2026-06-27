package com.examplatform.collab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeUpdateMessage {
    private String roomCode;
    private String senderUsername;
    private List<MonacoChange> changes;
    private String fullCode;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonacoChange {
        private MonacoRange range;
        private int rangeLength;
        private int rangeOffset;
        private String text;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonacoRange {
        private int startLineNumber;
        private int startColumn;
        private int endLineNumber;
        private int endColumn;
    }
}
