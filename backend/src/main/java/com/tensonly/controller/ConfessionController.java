package com.tensonly.controller;

import com.tensonly.dto.ConfessionDto;
import com.tensonly.security.SecurityUtil;
import com.tensonly.service.ConfessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/confessions")
public class ConfessionController {

    private final ConfessionService confessionService;
    private final SecurityUtil securityUtil;

    public ConfessionController(ConfessionService confessionService, SecurityUtil securityUtil) {
        this.confessionService = confessionService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    public ResponseEntity<List<ConfessionDto>> list(@RequestParam String eventId) {
        return ResponseEntity.ok(confessionService.listByEvent(eventId, securityUtil.currentUserId()));
    }

    @PostMapping
    public ResponseEntity<ConfessionDto> create(@Valid @RequestBody ConfessionDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(confessionService.create(request));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ConfessionDto> like(@PathVariable String id) {
        return ResponseEntity.ok(confessionService.toggleLike(id, securityUtil.currentUserId()));
    }
}
