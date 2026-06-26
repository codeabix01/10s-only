package com.tensonly.controller;

import com.tensonly.dto.EventDto;
import com.tensonly.dto.TicketDto;
import com.tensonly.repository.TicketRepository;
import com.tensonly.security.SecurityUtil;
import com.tensonly.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketRepository ticketRepository;
    private final EventService eventService;
    private final SecurityUtil securityUtil;

    public TicketController(TicketRepository ticketRepository,
                            EventService eventService,
                            SecurityUtil securityUtil) {
        this.ticketRepository = ticketRepository;
        this.eventService = eventService;
        this.securityUtil = securityUtil;
    }

    @GetMapping("/mine")
    public ResponseEntity<List<TicketDto>> mine() {
        String userId = securityUtil.currentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        List<TicketDto> tickets = ticketRepository.findByUserId(userId).stream()
                .map(TicketDto::from)
                .toList();

        // Enrich each ticket with the full event object
        for (TicketDto t : tickets) {
            try {
                EventDto event = eventService.get(t.getEventId());
                t.setEvent(event);
                t.setEventTitle(event.getTitle());
            } catch (Exception e) {
                // Event may have been deleted — ticket still shows without event details
            }
        }
        return ResponseEntity.ok(tickets);
    }
}
