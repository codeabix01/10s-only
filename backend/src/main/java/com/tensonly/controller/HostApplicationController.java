package com.tensonly.controller;

import com.tensonly.dto.HostApplicationDto;
import com.tensonly.entity.HostApplicationStatus;
import com.tensonly.security.SecurityUtil;
import com.tensonly.service.HostApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/host-applications")
public class HostApplicationController {

    private final HostApplicationService hostApplicationService;
    private final SecurityUtil securityUtil;

    public HostApplicationController(HostApplicationService hostApplicationService, SecurityUtil securityUtil) {
        this.hostApplicationService = hostApplicationService;
        this.securityUtil = securityUtil;
    }

    @PostMapping
    public ResponseEntity<HostApplicationDto> submit(@Valid @RequestBody HostApplicationDto.SubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hostApplicationService.submit(request, securityUtil.currentUserId()));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<HostApplicationDto>> mine() {
        return ResponseEntity.ok(hostApplicationService.mine(securityUtil.currentUserId()));
    }

    @GetMapping
    public ResponseEntity<List<HostApplicationDto>> list(@RequestParam(required = false) HostApplicationStatus status) {
        return ResponseEntity.ok(hostApplicationService.list(status));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<HostApplicationDto> review(
            @PathVariable String id,
            @Valid @RequestBody HostApplicationDto.ReviewRequest request
    ) {
        return ResponseEntity.ok(hostApplicationService.review(id, request.getStatus(), request.getReviewerNotes()));
    }
}
