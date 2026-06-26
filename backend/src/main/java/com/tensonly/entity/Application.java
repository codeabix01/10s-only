package com.tensonly.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "applications")
public class Application {

    @Id
    private String id;

    private String fullName;

    @Indexed
    private String emailOrPhone;

    private Integer age;

    private Gender gender;

    private String city;

    private String instagram;

    private String linkedin;

    private String occupation;

    private String whyJoin;

    private EventVibe favoriteVibe;

    private String referralCode;

    private String quizAnswersJson;

    private Integer quizScore;

    @Indexed
    private ApplicationStatus status;

    private Instant submittedAt;

    private Instant reviewedAt;

    private String reviewerNotes;

    private String reviewerId;

    public Application() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmailOrPhone() { return emailOrPhone; }
    public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getWhyJoin() { return whyJoin; }
    public void setWhyJoin(String whyJoin) { this.whyJoin = whyJoin; }

    public EventVibe getFavoriteVibe() { return favoriteVibe; }
    public void setFavoriteVibe(EventVibe favoriteVibe) { this.favoriteVibe = favoriteVibe; }

    public String getReferralCode() { return referralCode; }
    public void setReferralCode(String referralCode) { this.referralCode = referralCode; }

    public String getQuizAnswersJson() { return quizAnswersJson; }
    public void setQuizAnswersJson(String quizAnswersJson) { this.quizAnswersJson = quizAnswersJson; }

    public Integer getQuizScore() { return quizScore; }
    public void setQuizScore(Integer quizScore) { this.quizScore = quizScore; }

    public ApplicationStatus getStatus() { return status; }
    public void setStatus(ApplicationStatus status) { this.status = status; }

    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getReviewerId() { return reviewerId; }
    public void setReviewerId(String reviewerId) { this.reviewerId = reviewerId; }
}
