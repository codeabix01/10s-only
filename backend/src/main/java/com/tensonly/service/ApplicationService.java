package com.tensonly.service;

import com.tensonly.dto.ApplicationDto;
import com.tensonly.dto.UserDto;
import com.tensonly.entity.Application;
import com.tensonly.entity.ApplicationStatus;
import com.tensonly.entity.Role;
import com.tensonly.repository.ApplicationRepository;
import com.tensonly.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ApplicationService(ApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    public ApplicationDto submit(ApplicationDto.SubmitRequest request) {
        Application app = new Application();
        app.setFullName(request.getFullName());
        app.setEmailOrPhone(request.getEmailOrPhone());
        app.setAge(request.getAge());
        app.setGender(request.getGender());
        app.setCity(request.getCity());
        app.setInstagram(request.getInstagram());
        app.setLinkedin(request.getLinkedin());
        app.setOccupation(request.getOccupation());
        app.setWhyJoin(request.getWhyJoin());
        app.setFavoriteVibe(request.getFavoriteVibe());
        app.setReferralCode(request.getReferralCode());
        app.setQuizAnswersJson(request.getQuizAnswersJson());
        app.setQuizScore(request.getQuizScore());
        app.setStatus(ApplicationStatus.PENDING);
        app.setSubmittedAt(Instant.now());
        app = applicationRepository.save(app);
        return ApplicationDto.from(app, userRepository.findByEmailOrPhone(app.getEmailOrPhone()).map(UserDto::from).orElse(null));
    }

    public List<ApplicationDto> list(ApplicationStatus status) {
        List<Application> apps;
        if (status != null) {
            apps = applicationRepository.findByStatusOrderByIdDesc(status);
        } else {
            apps = applicationRepository.findAll();
        }
        return apps.stream()
            .map(app -> ApplicationDto.from(
                app,
                userRepository.findByEmailOrPhone(app.getEmailOrPhone()).map(UserDto::from).orElse(null)
            ))
            .toList();
    }

    /** Latest application submitted by the currently-authenticated user, or null. */
    public ApplicationDto mine(String emailOrPhone) {
        if (emailOrPhone == null || emailOrPhone.isBlank()) {
            return null;
        }
        return applicationRepository.findByEmailOrPhoneOrderBySubmittedAtDesc(emailOrPhone).stream()
                .findFirst()
                .map(app -> ApplicationDto.from(
                        app,
                        userRepository.findByEmailOrPhone(app.getEmailOrPhone()).map(UserDto::from).orElse(null)
                ))
                .orElse(null);
    }

    public ApplicationDto review(String applicationId, ApplicationStatus status, String reviewerNotes, String reviewerId) {
        if (applicationId == null || applicationId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found");
        }
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        app.setStatus(status);
        app.setReviewerNotes(reviewerNotes);
        app.setReviewerId(reviewerId);
        app.setReviewedAt(Instant.now());
        app = applicationRepository.save(app);

        // On approval, upgrade the matching user (if exists) to MEMBER and approve them
        if (status == ApplicationStatus.APPROVED) {
            userRepository.findByEmailOrPhone(app.getEmailOrPhone()).ifPresent(user -> {
                if (user.getRole() == null || user.getRole() == Role.GUEST) {
                    user.setRole(Role.MEMBER);
                }
                user.setApproved(true);
                userRepository.save(user);
            });
        }

        return ApplicationDto.from(app, userRepository.findByEmailOrPhone(app.getEmailOrPhone()).map(UserDto::from).orElse(null));
    }
}
