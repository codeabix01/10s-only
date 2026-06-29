package com.tensonly.controller;

import com.tensonly.dto.EventDto;
import com.tensonly.entity.ApplicationStatus;
import com.tensonly.entity.Event;
import com.tensonly.entity.EventStatus;
import com.tensonly.entity.Payment;
import com.tensonly.entity.Role;
import com.tensonly.entity.User;
import com.tensonly.repository.ApplicationRepository;
import com.tensonly.repository.EventRepository;
import com.tensonly.repository.PaymentRepository;
import com.tensonly.repository.UserRepository;
import com.tensonly.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EventRepository eventRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ApplicationRepository applicationRepository;
    private final EventService eventService;

    public AdminController(EventRepository eventRepository,
                           PaymentRepository paymentRepository,
                           UserRepository userRepository,
                           ApplicationRepository applicationRepository,
                           EventService eventService) {
        this.eventRepository = eventRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.eventService = eventService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalMembers", userRepository.countByRole(Role.MEMBER));
        stats.put("totalHosts", userRepository.countByRole(Role.HOST));
        stats.put("totalAdmins", userRepository.countByRole(Role.ADMIN));
        stats.put("approvedUsers", userRepository.countByApprovedTrue());

        stats.put("totalEvents", eventRepository.count());
        // New events are created as DRAFT and surfaced for review alongside PENDING_APPROVAL.
        stats.put("pendingEvents",
                eventRepository.countByStatus(EventStatus.PENDING_APPROVAL)
                        + eventRepository.countByStatus(EventStatus.DRAFT));
        stats.put("approvedEvents", eventRepository.countByStatus(EventStatus.APPROVED));
        stats.put("pendingApplications", applicationRepository.countByStatus(ApplicationStatus.PENDING));

        List<Event> allEvents = eventRepository.findAll();
        BigDecimal totalRevenue = allEvents.stream()
                .map(e -> e.getRevenue() == null ? BigDecimal.ZERO : e.getRevenue())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        int ticketsSold = allEvents.stream()
                .mapToInt(e -> e.getTicketsSold() == null ? 0 : e.getTicketsSold())
                .sum();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalTicketsSold", ticketsSold);
        stats.put("totalPayments", paymentRepository.count());
        return ResponseEntity.ok(stats);
    }

    /** Per-city rollup: events, members, revenue. Matches the frontend CityStat shape. */
    @GetMapping("/city-stats")
    public ResponseEntity<List<Map<String, Object>>> cityStats() {
        List<Event> events = eventRepository.findAll();
        List<User> users = userRepository.findAll();

        Map<String, Map<String, Object>> byCity = new LinkedHashMap<>();

        for (Event e : events) {
            String city = e.getCity() == null ? "unknown" : e.getCity().toLowerCase();
            Map<String, Object> row = byCity.computeIfAbsent(city, AdminController::emptyCityRow);
            row.put("city", city);
            row.put("events", ((Number) row.get("events")).intValue() + 1);
            BigDecimal rev = e.getRevenue() == null ? BigDecimal.ZERO : e.getRevenue();
            row.put("revenue", ((BigDecimal) row.get("revenue")).add(rev));
        }

        for (User u : users) {
            String city = u.getCity() == null ? "unknown" : u.getCity().toLowerCase();
            Map<String, Object> row = byCity.computeIfAbsent(city, AdminController::emptyCityRow);
            row.put("city", city);
            row.put("members", ((Number) row.get("members")).intValue() + 1);
        }

        return ResponseEntity.ok(new ArrayList<>(byCity.values()));
    }

    private static Map<String, Object> emptyCityRow(String city) {
        Map<String, Object> row = new HashMap<>();
        row.put("city", city);
        row.put("events", 0);
        row.put("members", 0);
        row.put("revenue", BigDecimal.ZERO);
        return row;
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> payments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @GetMapping("/events/pending")
    public ResponseEntity<List<EventDto>> pendingEvents() {
        return ResponseEntity.ok(
                eventRepository.findByStatus(EventStatus.PENDING_APPROVAL).stream()
                        .map(EventDto::from).toList()
        );
    }

    @PostMapping("/events/{id}/approve")
    public ResponseEntity<EventDto> approveEvent(@PathVariable String id) {
        Event event = eventService.getEntity(id);
        event.setStatus(EventStatus.APPROVED);
        return ResponseEntity.ok(EventDto.from(eventRepository.save(event)));
    }

    @PostMapping("/events/{id}/reject")
    public ResponseEntity<EventDto> rejectEvent(@PathVariable String id) {
        Event event = eventService.getEntity(id);
        event.setStatus(EventStatus.REJECTED);
        return ResponseEntity.ok(EventDto.from(eventRepository.save(event)));
    }
}
