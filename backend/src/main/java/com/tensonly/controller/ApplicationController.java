package com.tensonly.controller;

import com.tensonly.dto.ApplicationDto;
import com.tensonly.entity.ApplicationStatus;
import com.tensonly.security.SecurityUtil;
import com.tensonly.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final SecurityUtil securityUtil;

    public ApplicationController(ApplicationService applicationService, SecurityUtil securityUtil) {
        this.applicationService = applicationService;
        this.securityUtil = securityUtil;
    }

    @PostMapping
    public ResponseEntity<ApplicationDto> submit(@Valid @RequestBody ApplicationDto.SubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(applicationService.submit(request));
    }

    @GetMapping
    public ResponseEntity<List<ApplicationDto>> list(@RequestParam(required = false) ApplicationStatus status) {
        return ResponseEntity.ok(applicationService.list(status));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApplicationDto> mine() {
        return ResponseEntity.ok(applicationService.mine(securityUtil.currentUserEmail()));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApplicationDto> review(
            @PathVariable String id,
            @Valid @RequestBody ApplicationDto.ReviewRequest request
    ) {
        return ResponseEntity.ok(applicationService.review(
                id, request.getStatus(), request.getReviewerNotes(), securityUtil.currentUserId()
        ));
    }
}
