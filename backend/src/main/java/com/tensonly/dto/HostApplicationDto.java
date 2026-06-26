package com.tensonly.dto;

import com.tensonly.entity.HostApplication;
import com.tensonly.entity.HostApplicationStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public class HostApplicationDto {

    private String id;
    private String userId;
    private String userName;
    private String userEmail;
    private String crewName;
    private String city;
    private String bio;
    private String pastEvents;
    private String instagram;
    private String soundcloud;
    private String whyHost;
    private List<String> sampleLineup;
    private HostApplicationStatus status;
    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewerNotes;

    public HostApplicationDto() {
    }

    public static HostApplicationDto from(HostApplication h) {
        HostApplicationDto dto = new HostApplicationDto();
        dto.id = h.getId();
        dto.userId = h.getUserId();
        dto.userName = h.getUserName();
        dto.userEmail = h.getUserEmail();
        dto.crewName = h.getCrewName();
        dto.city = h.getCity();
        dto.bio = h.getBio();
        dto.pastEvents = h.getPastEvents();
        dto.instagram = h.getInstagram();
        dto.soundcloud = h.getSoundcloud();
        dto.whyHost = h.getWhyHost();
        dto.sampleLineup = h.getSampleLineup();
        dto.status = h.getStatus();
        dto.submittedAt = h.getSubmittedAt();
        dto.reviewedAt = h.getReviewedAt();
        dto.reviewerNotes = h.getReviewerNotes();
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getCrewName() { return crewName; }
    public void setCrewName(String crewName) { this.crewName = crewName; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPastEvents() { return pastEvents; }
    public void setPastEvents(String pastEvents) { this.pastEvents = pastEvents; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getSoundcloud() { return soundcloud; }
    public void setSoundcloud(String soundcloud) { this.soundcloud = soundcloud; }

    public String getWhyHost() { return whyHost; }
    public void setWhyHost(String whyHost) { this.whyHost = whyHost; }

    public List<String> getSampleLineup() { return sampleLineup; }
    public void setSampleLineup(List<String> sampleLineup) { this.sampleLineup = sampleLineup; }

    public HostApplicationStatus getStatus() { return status; }
    public void setStatus(HostApplicationStatus status) { this.status = status; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public static class SubmitRequest {
        @NotBlank
        private String crewName;

        @NotBlank
        private String city;

        @NotBlank
        private String bio;

        private String pastEvents;
        private String instagram;
        private String soundcloud;

        @NotBlank
        private String whyHost;

        private List<String> sampleLineup;

        public String getCrewName() { return crewName; }
        public void setCrewName(String crewName) { this.crewName = crewName; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }

        public String getPastEvents() { return pastEvents; }
        public void setPastEvents(String pastEvents) { this.pastEvents = pastEvents; }

        public String getInstagram() { return instagram; }
        public void setInstagram(String instagram) { this.instagram = instagram; }

        public String getSoundcloud() { return soundcloud; }
        public void setSoundcloud(String soundcloud) { this.soundcloud = soundcloud; }

        public String getWhyHost() { return whyHost; }
        public void setWhyHost(String whyHost) { this.whyHost = whyHost; }

        public List<String> getSampleLineup() { return sampleLineup; }
        public void setSampleLineup(List<String> sampleLineup) { this.sampleLineup = sampleLineup; }
    }

    public static class ReviewRequest {
        private HostApplicationStatus status;
        private String reviewerNotes;

        public HostApplicationStatus getStatus() { return status; }
        public void setStatus(HostApplicationStatus status) { this.status = status; }

        public String getReviewerNotes() { return reviewerNotes; }
        public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }
    }
}
