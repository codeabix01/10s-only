package com.tensonly.service;

import com.tensonly.dto.UserDto;
import com.tensonly.config.AppProperties;
import com.tensonly.entity.ApplicationStatus;
import com.tensonly.entity.Role;
import com.tensonly.entity.User;
import com.tensonly.repository.ApplicationRepository;
import com.tensonly.repository.UserRepository;
import com.tensonly.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties appProperties;

    public AuthService(UserRepository userRepository,
                       ApplicationRepository applicationRepository,
                       OtpService otpService,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       AppProperties appProperties) {
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.appProperties = appProperties;
    }

    public void requestOtp(String emailOrPhone) {
        otpService.requestOtp(emailOrPhone);
    }

    public boolean verifyOtp(String emailOrPhone, String code) {
        return otpService.verifyOtp(emailOrPhone, code);
    }

    public UserDto.AuthResponse register(UserDto.RegisterRequest request) {
        if (userRepository.findByEmailOrPhone(request.getEmailOrPhone()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists with this email or phone");
        }

        User user = new User();
        user.setEmailOrPhone(request.getEmailOrPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(Role.MEMBER);
        user.setApproved(false);
        user.setCity(request.getCity());
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setLoyaltyPoints(0);
        user.setAttendedCount(0);
        // Auto-approve if they already have an approved membership application
        if (applicationRepository.existsByEmailOrPhoneAndStatus(request.getEmailOrPhone(), ApplicationStatus.APPROVED)) {
            user.setApproved(true);
        }
        user = userRepository.save(user);

        String token = jwtService.generate(user.getId(), user.getEmailOrPhone(), List.of(user.getRole().name()));
        return new UserDto.AuthResponse(token, UserDto.from(user));
    }

    public UserDto.AuthResponse login(UserDto.LoginRequest request) {
        User user = userRepository.findByEmailOrPhone(request.getEmailOrPhone())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtService.generate(user.getId(), user.getEmailOrPhone(), List.of(user.getRole().name()));
        return new UserDto.AuthResponse(token, UserDto.from(user));
    }

    public UserDto.AuthResponse syncSupabaseUser(UserDto.SupabaseSyncRequest request) {
        User user = userRepository.findByEmailOrPhone(request.getEmailOrPhone())
                .orElseGet(User::new);

        user.setEmailOrPhone(request.getEmailOrPhone());
        user.setName(request.getName());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setCity(request.getCity());
        // A whitelisted admin email is always promoted to ADMIN, even if an
        // earlier login had already persisted this user as a MEMBER.
        Role whitelistedRole = resolveSupabaseRole(request.getEmailOrPhone());
        if (whitelistedRole != null) {
            user.setRole(whitelistedRole);
        } else if (user.getRole() == null) {
            user.setRole(Role.MEMBER);
        }
        if (user.getPasswordHash() == null) {
            user.setPasswordHash("supabase-" + System.currentTimeMillis());
        }
        if (!user.isApproved()) {
            user.setApproved(true);
        }

        user = userRepository.save(user);

        String token = jwtService.generate(user.getId(), user.getEmailOrPhone(), List.of(user.getRole().name()));
        return new UserDto.AuthResponse(token, UserDto.from(user));
    }

    private Role resolveSupabaseRole(String emailOrPhone) {
        if (emailOrPhone == null) {
            return null;
        }
        String normalized = emailOrPhone.trim().toLowerCase(Locale.ROOT);
        List<String> adminEmails = appProperties.auth() == null || appProperties.auth().adminEmails() == null
                ? List.of()
                : appProperties.auth().adminEmails();
        for (String adminEmail : adminEmails) {
            if (adminEmail != null && normalized.equals(adminEmail.trim().toLowerCase(Locale.ROOT))) {
                return Role.ADMIN;
            }
        }
        return null;
    }

    public UserDto me(String userId) {
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return UserDto.from(user);
    }
}
