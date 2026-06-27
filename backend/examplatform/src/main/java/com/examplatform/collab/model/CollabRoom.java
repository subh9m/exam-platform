package com.examplatform.collab.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "collab_rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollabRoom {

    @Id
    private String id;

    private String roomCode; // 4-digit unique alphanumeric code
    
    private String creatorId; // User ID of creator

    private String creatorUsername; // Username of the room creator (owner)

    @Builder.Default
    private List<String> participantUsernames = new ArrayList<>(); // Usernames currently in the room

    @Builder.Default
    private String code = ""; // Current code contents in the editor

    @Builder.Default
    private String language = "javascript"; // Selected language (javascript, python, cpp, java)

    private Date createdAt;

    private Date lastActivityTime;
}
