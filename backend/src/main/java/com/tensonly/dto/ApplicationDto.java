package com.tensonly.dto;

import com.tensonly.entity.Application;
import com.tensonly.entity.ApplicationStatus;
import com.tensonly.entity.EventVibe;
import com.tensonly.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

import java.time.Instant;

public class ApplicationDto {

    private String id;
    private String fullName;
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
    private ApplicationStatus status;
    private Instant submittedAt;
    private Instant reviewedAt;
    private String reviewerNotes;
    private String reviewerId;
    private UserDto user;

    public ApplicationDto() {
    }

    public static ApplicationDto from(Application a) {
        return from(a, null);
    }

    public static ApplicationDto from(Application a, UserDto user) {
        ApplicationDto dto = new ApplicationDto();
        dto.id = a.getId();
        dto.fullName = a.getFullName();
        dto.emailOrPhone = a.getEmailOrPhone();
        dto.age = a.getAge();
        dto.gender = a.getGender();
        dto.city = a.getCity();
        dto.instagram = a.getInstagram();
        dto.linkedin = a.getLinkedin();
        dto.occupation = a.getOccupation();
        dto.whyJoin = a.getWhyJoin();
        dto.favoriteVibe = a.getFavoriteVibe();
        dto.referralCode = a.getReferralCode();
        dto.quizAnswersJson = a.getQuizAnswersJson();
        dto.quizScore = a.getQuizScore();
        dto.status = a.getStatus();
        dto.submittedAt = a.getSubmittedAt();
        dto.reviewedAt = a.getReviewedAt();
        dto.reviewerNotes = a.getReviewerNotes();
        dto.reviewerId = a.getReviewerId();
        dto.user = user;
        return dto;
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

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }

    public static class SubmitRequest {
        @NotBlank
        private String fullName;

        @NotBlank
        private String emailOrPhone;

        @Positive
        private Integer age;

        private Gender gender;
        private String city;
        private String instagram;
        private String linkedin;
        private String occupation;

        @NotBlank
        private String whyJoin;

        private EventVibe favoriteVibe;
        private String referralCode;
        private String quizAnswersJson;
        private Integer quizScore;

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
    }

    public static class ReviewRequest {
        private ApplicationStatus status;
        private String reviewerNotes;

        public ApplicationStatus getStatus() { return status; }
        public void setStatus(ApplicationStatus status) { this.status = status; }

        public String getReviewerNotes() { return reviewerNotes; }
        public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }
    }
}
