package com.tensonly.dto;

import com.tensonly.entity.Confession;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class ConfessionDto {

    private String id;
    private String eventId;
    private String anonymousName;
    private String message;
    private int likes;
    private boolean likedByMe;
    private Instant createdAt;

    public ConfessionDto() {
    }

    public static ConfessionDto from(Confession c) {
        ConfessionDto dto = new ConfessionDto();
        dto.id = c.getId();
        dto.eventId = c.getEventId();
        dto.anonymousName = c.getAnonymousName();
        dto.message = c.getMessage();
        dto.likes = c.getLikes();
        dto.createdAt = c.getCreatedAt();
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getAnonymousName() { return anonymousName; }
    public void setAnonymousName(String anonymousName) { this.anonymousName = anonymousName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public boolean isLikedByMe() { return likedByMe; }
    public void setLikedByMe(boolean likedByMe) { this.likedByMe = likedByMe; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class CreateRequest {
        @NotBlank
        private String eventId;

        @NotBlank
        private String message;

        private String anonymousName;

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getAnonymousName() { return anonymousName; }
        public void setAnonymousName(String anonymousName) { this.anonymousName = anonymousName; }
    }
}
