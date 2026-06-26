package com.tensonly.service;

import com.tensonly.dto.HostApplicationDto;
import com.tensonly.entity.HostApplication;
import com.tensonly.entity.HostApplicationStatus;
import com.tensonly.entity.Role;
import com.tensonly.entity.User;
import com.tensonly.repository.HostApplicationRepository;
import com.tensonly.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class HostApplicationService {

    private final HostApplicationRepository hostApplicationRepository;
    private final UserRepository userRepository;

    public HostApplicationService(HostApplicationRepository hostApplicationRepository,
                                  UserRepository userRepository) {
        this.hostApplicationRepository = hostApplicationRepository;
        this.userRepository = userRepository;
    }

    public HostApplicationDto submit(HostApplicationDto.SubmitRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        HostApplication app = new HostApplication();
        app.setUserId(user.getId());
        app.setUserName(user.getName());
        app.setUserEmail(user.getEmailOrPhone());
        app.setCrewName(request.getCrewName());
        app.setCity(request.getCity());
        app.setBio(request.getBio());
        app.setPastEvents(request.getPastEvents());
        app.setInstagram(request.getInstagram());
        app.setSoundcloud(request.getSoundcloud());
        app.setWhyHost(request.getWhyHost());
        app.setSampleLineup(request.getSampleLineup());
        app.setStatus(HostApplicationStatus.PENDING);
        app.setSubmittedAt(Instant.now());
        app = hostApplicationRepository.save(app);
        return HostApplicationDto.from(app);
    }

    public List<HostApplicationDto> mine(String userId) {
        return hostApplicationRepository.findByUserId(userId).stream()
                .map(HostApplicationDto::from).toList();
    }

    public List<HostApplicationDto> list(HostApplicationStatus status) {
        List<HostApplication> apps;
        if (status != null) {
            apps = hostApplicationRepository.findByStatus(status);
        } else {
            apps = hostApplicationRepository.findAllByOrderBySubmittedAtDesc();
        }
        return apps.stream().map(HostApplicationDto::from).toList();
    }

    public HostApplicationDto review(String applicationId, HostApplicationStatus status, String reviewerNotes) {
        HostApplication app = hostApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Host application not found"));

        app.setStatus(status);
        app.setReviewerNotes(reviewerNotes);
        app.setReviewedAt(Instant.now());
        app = hostApplicationRepository.save(app);

        // On approval, upgrade the user to HOST
        if (status == HostApplicationStatus.APPROVED) {
            userRepository.findById(app.getUserId()).ifPresent(user -> {
                user.setRole(Role.HOST);
                user.setApproved(true);
                if (user.getHostSince() == null) {
                    user.setHostSince(LocalDate.now());
                }
                userRepository.save(user);
            });
        }

        return HostApplicationDto.from(app);
    }
}
