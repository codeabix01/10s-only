package com.tensonly.dto;

import com.tensonly.entity.Gender;
import com.tensonly.entity.Role;
import com.tensonly.entity.User;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.time.LocalDate;

public class UserDto {

    private String id;
    private String emailOrPhone;
    private String name;
    private Role role;
    private boolean approved;
    private String bio;
    private String avatarUrl;
    private String city;
    private String instagram;
    private String linkedin;
    private String occupation;
    private Integer age;
    private Gender gender;
    private int loyaltyPoints;
    private int attendedCount;
    private LocalDate hostSince;
    private Instant createdAt;

    public UserDto() {
    }

    public static UserDto from(User u) {
        UserDto dto = new UserDto();
        dto.id = u.getId();
        dto.emailOrPhone = u.getEmailOrPhone();
        dto.name = u.getName();
        dto.role = u.getRole();
        dto.approved = u.isApproved();
        dto.bio = u.getBio();
        dto.avatarUrl = u.getAvatarUrl();
        dto.city = u.getCity();
        dto.instagram = u.getInstagram();
        dto.linkedin = u.getLinkedin();
        dto.occupation = u.getOccupation();
        dto.age = u.getAge();
        dto.gender = u.getGender();
        dto.loyaltyPoints = u.getLoyaltyPoints();
        dto.attendedCount = u.getAttendedCount();
        dto.hostSince = u.getHostSince();
        dto.createdAt = u.getCreatedAt();
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmailOrPhone() { return emailOrPhone; }
    public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getInstagram() { return instagram; }
    public void setInstagram(String instagram) { this.instagram = instagram; }

    public String getLinkedin() { return linkedin; }
    public void setLinkedin(String linkedin) { this.linkedin = linkedin; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public int getAttendedCount() { return attendedCount; }
    public void setAttendedCount(int attendedCount) { this.attendedCount = attendedCount; }

    public LocalDate getHostSince() { return hostSince; }
    public void setHostSince(LocalDate hostSince) { this.hostSince = hostSince; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class RegisterRequest {
        @NotBlank
        private String emailOrPhone;

        @NotBlank
        private String password;

        @NotBlank
        private String name;

        private String city;
        private Integer age;
        private Gender gender;

        public String getEmailOrPhone() { return emailOrPhone; }
        public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public Integer getAge() { return age; }
        public void setAge(Integer age) { this.age = age; }

        public Gender getGender() { return gender; }
        public void setGender(Gender gender) { this.gender = gender; }
    }

    public static class LoginRequest {
        @NotBlank
        private String emailOrPhone;

        @NotBlank
        private String password;

        public String getEmailOrPhone() { return emailOrPhone; }
        public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String token;
        private UserDto user;

        public AuthResponse() {
        }

        public AuthResponse(String token, UserDto user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }

    public static class OtpRequest {
        @NotBlank
        @com.fasterxml.jackson.annotation.JsonProperty("identifier")
        private String emailOrPhone;

        public String getEmailOrPhone() { return emailOrPhone; }
        public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }
    }

    public static class OtpVerifyRequest {
        @NotBlank
        @com.fasterxml.jackson.annotation.JsonProperty("identifier")
        private String emailOrPhone;

        @NotBlank
        private String code;

        public String getEmailOrPhone() { return emailOrPhone; }
        public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    public static class SupabaseSyncRequest {
        @NotBlank
        private String emailOrPhone;

        @NotBlank
        private String name;

        private String avatarUrl;

        private String city;

        public String getEmailOrPhone() { return emailOrPhone; }
        public void setEmailOrPhone(String emailOrPhone) { this.emailOrPhone = emailOrPhone; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
    }
}
