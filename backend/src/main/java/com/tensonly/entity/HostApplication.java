package com.tensonly.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "host_applications")
public class HostApplication {

    @Id
    private String id;

    @Indexed
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

    @Indexed
    private HostApplicationStatus status;

    private Instant submittedAt;

    private Instant reviewedAt;

    private String reviewerNotes;

    public HostApplication() {
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
}
