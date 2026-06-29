package com.tensonly.controller;

import com.tensonly.dto.EventDto;
import com.tensonly.security.SecurityUtil;
import com.tensonly.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final SecurityUtil securityUtil;

    public EventController(EventService eventService, SecurityUtil securityUtil) {
        this.eventService = eventService;
        this.securityUtil = securityUtil;
    }

    @GetMapping
    public ResponseEntity<List<EventDto>> list(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String vibe
    ) {
        return ResponseEntity.ok(eventService.list(city, vibe));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<EventDto>> pending() {
        return ResponseEntity.ok(eventService.pending());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<EventDto>> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "25") double radius) {
        return ResponseEntity.ok(eventService.nearby(lat, lng, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> get(@PathVariable String id) {
        return ResponseEntity.ok(eventService.get(id));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<EventDto> approve(@PathVariable String id) {
        return ResponseEntity.ok(eventService.approve(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<EventDto> reject(
            @PathVariable String id,
            @RequestBody(required = false) java.util.Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(eventService.reject(id, reason));
    }

    @GetMapping("/host")
    public ResponseEntity<List<EventDto>> byHost() {
        return ResponseEntity.ok(eventService.byHost(securityUtil.currentUserId()));
    }

    @PostMapping
    public ResponseEntity<EventDto> create(@Valid @RequestBody EventDto.CreateRequest request) {
        EventDto created = eventService.create(request, securityUtil.currentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
