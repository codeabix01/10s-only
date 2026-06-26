package com.tensonly.controller;

import com.tensonly.dto.UserDto;
import com.tensonly.entity.Role;
import com.tensonly.entity.User;
import com.tensonly.repository.UserRepository;
import com.tensonly.security.JwtService;
import com.tensonly.security.SecurityUtil;
import com.tensonly.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final SecurityUtil securityUtil;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(AuthService authService, SecurityUtil securityUtil,
                          UserRepository userRepository, JwtService jwtService) {
        this.authService = authService;
        this.securityUtil = securityUtil;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/otp/request")
    public ResponseEntity<Map<String, Object>> requestOtp(@Valid @RequestBody UserDto.OtpRequest request) {
        authService.requestOtp(request.getEmailOrPhone());
        return ResponseEntity.ok(Map.of("sent", true));
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<UserDto.AuthResponse> verifyOtp(@Valid @RequestBody UserDto.OtpVerifyRequest request) {
        boolean valid = authService.verifyOtp(request.getEmailOrPhone(), request.getCode());
        if (!valid) {
            return ResponseEntity.badRequest().build();
        }

        // Find or create user
        User user = userRepository.findByEmailOrPhone(request.getEmailOrPhone())
            .orElseGet(() -> {
                User u = new User();
                u.setEmailOrPhone(request.getEmailOrPhone());
                u.setPasswordHash("otp-" + System.currentTimeMillis());
                u.setName(request.getEmailOrPhone().split("@")[0]);
                u.setRole(Role.GUEST);
                u.setApproved(false);
                return userRepository.save(u);
            });

        // Generate JWT
        String token = jwtService.generate(user.getId(), user.getEmailOrPhone(),
            List.of(user.getRole().name()));

        return ResponseEntity.ok(new UserDto.AuthResponse(token, UserDto.from(user)));
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto.AuthResponse> register(@Valid @RequestBody UserDto.RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<UserDto.AuthResponse> login(@Valid @RequestBody UserDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/supabase/sync")
    public ResponseEntity<UserDto.AuthResponse> syncSupabaseUser(@Valid @RequestBody UserDto.SupabaseSyncRequest request) {
        return ResponseEntity.ok(authService.syncSupabaseUser(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me() {
        return ResponseEntity.ok(authService.me(securityUtil.currentUserId()));
    }
}
