package com.tensonly.controller;

import com.tensonly.entity.HostVenue;
import com.tensonly.entity.LedgerEntry;
import com.tensonly.repository.HostVenueRepository;
import com.tensonly.repository.LedgerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/host")
public class HostController {

    private final HostVenueRepository hostVenueRepository;
    private final LedgerRepository ledgerRepository;

    public HostController(HostVenueRepository hostVenueRepository, LedgerRepository ledgerRepository) {
        this.hostVenueRepository = hostVenueRepository;
        this.ledgerRepository = ledgerRepository;
    }

    @GetMapping("/venues")
    public ResponseEntity<List<HostVenue>> venues() {
        return ResponseEntity.ok(hostVenueRepository.findAll());
    }

    @GetMapping("/ledger")
    public ResponseEntity<List<LedgerEntry>> ledger(@RequestParam(required = false) String eventId) {
        if (eventId != null) {
            return ResponseEntity.ok(ledgerRepository.findByEventIdOrderByTimestampDesc(eventId));
        }
        return ResponseEntity.ok(ledgerRepository.findAll());
    }
}
