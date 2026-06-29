package com.tensonly.service;

import com.tensonly.dto.EventDto;
import com.tensonly.entity.Event;
import com.tensonly.entity.EventStatus;
import com.tensonly.entity.User;
import com.tensonly.repository.EventRepository;
import com.tensonly.repository.UserRepository;
import org.springframework.data.geo.Metrics;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.NearQuery;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class EventService {

    // Center coordinates [lng, lat] for each city slug the frontend uses
    public static final Map<String, double[]> CITY_COORDS = Map.of(
        "mumbai",    new double[]{72.8777, 19.0760},
        "delhi",     new double[]{77.2090, 28.6139},
        "bangalore", new double[]{77.5946, 12.9716},
        "goa",       new double[]{74.1240, 15.2993},
        "pune",      new double[]{73.8567, 18.5204},
        "hyderabad", new double[]{78.4867, 17.3850}
    );

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public EventService(EventRepository eventRepository, UserRepository userRepository, MongoTemplate mongoTemplate) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public List<EventDto> list(String city, String vibe) {
        List<Event> events;
        if (city != null && vibe != null) {
            events = eventRepository.findByCityAndVibe(city, parseVibe(vibe));
        } else if (city != null) {
            events = eventRepository.findByCity(city);
        } else if (vibe != null) {
            events = eventRepository.findByVibe(parseVibe(vibe));
        } else {
            events = eventRepository.findAll();
        }
        // Filter to only show LIVE or APPROVED events
        events = events.stream()
                .filter(e -> e.getStatus() == EventStatus.LIVE || e.getStatus() == EventStatus.APPROVED)
                .toList();
        return events.stream().map(EventDto::from).toList();
    }

    /** Tolerant vibe parser: accepts lowercase and hyphenated forms (e.g. "drum-and-bass"). */
    private com.tensonly.entity.EventVibe parseVibe(String vibe) {
        try {
            return com.tensonly.entity.EventVibe.valueOf(vibe.trim().toUpperCase().replace('-', '_'));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid vibe: " + vibe);
        }
    }

    public EventDto get(String id) {
        return EventDto.from(getEntity(id));
    }

    public Event getEntity(String id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found: " + id));
    }

    public EventDto create(EventDto.CreateRequest request, String hostUserId) {
        User host = userRepository.findById(hostUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Host user not found"));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setVibe(request.getVibe());
        event.setCity(request.getCity());
        event.setVenueName(request.getVenueName());
        event.setVenueAddress(request.getVenueAddress());
        event.setVenueCapacity(request.getVenueCapacity());
        event.setStartAt(request.getStartAt());
        event.setEndAt(request.getEndAt());
        event.setTicketPrice(request.getTicketPrice());
        event.setTotalTickets(request.getTotalTickets());
        event.setTicketsSold(0);
        event.setRevenue(BigDecimal.ZERO);
        event.setDescription(request.getDescription());
        event.setLineup(request.getLineup());
        event.setCoverImage(request.getCoverImage());
        event.setVisibility(request.getVisibility() != null ? request.getVisibility() : com.tensonly.entity.EventVisibility.MEMBERS_ONLY);
        event.setLocation(resolveLocation(request.getLongitude(), request.getLatitude(), request.getCity()));
        // New events always start as DRAFT for admin approval
        event.setStatus(EventStatus.DRAFT);
        event.setHostId(host.getId());
        event.setHostName(host.getName());

        event = eventRepository.save(event);
        return EventDto.from(event);
    }

    public List<EventDto> byHost(String hostUserId) {
        return eventRepository.findByHostId(hostUserId).stream().map(EventDto::from).toList();
    }

    /** Events awaiting admin review. */
    public List<EventDto> pending() {
        return eventRepository
                .findByStatusIn(List.of(EventStatus.DRAFT, EventStatus.PENDING_APPROVAL))
                .stream()
                .map(EventDto::from)
                .toList();
    }

    public EventDto approve(String id) {
        Event event = getEntity(id);
        event.setStatus(EventStatus.LIVE);
        event.setRejectionReason(null);
        return EventDto.from(eventRepository.save(event));
    }

    public EventDto reject(String id, String reason) {
        Event event = getEntity(id);
        event.setStatus(EventStatus.REJECTED);
        event.setRejectionReason(reason);
        return EventDto.from(eventRepository.save(event));
    }

    public List<EventDto> nearby(double lat, double lng, double radiusKm) {
        NearQuery nearQuery = NearQuery
                .near(lng, lat, Metrics.KILOMETERS)
                .maxDistance(radiusKm, Metrics.KILOMETERS)
                .spherical(true)
                .query(Query.query(
                        Criteria.where("status").in(EventStatus.LIVE, EventStatus.APPROVED)
                                .and("location").exists(true)
                ));
        return mongoTemplate.geoNear(nearQuery, Event.class)
                .getContent()
                .stream()
                .map(EventDto::from)
                .toList();
    }

    /** Returns explicit coords if provided, otherwise falls back to the city centre. */
    public static GeoJsonPoint resolveLocation(Double lng, Double lat, String city) {
        if (lng != null && lat != null) return new GeoJsonPoint(lng, lat);
        if (city != null) {
            double[] coords = CITY_COORDS.get(city.trim().toLowerCase());
            if (coords != null) return new GeoJsonPoint(coords[0], coords[1]);
        }
        return null;
    }

    public Event incrementTicketsSold(String eventId, int by, BigDecimal revenueAddition) {
        Event event = getEntity(eventId);
        int sold = (event.getTicketsSold() == null ? 0 : event.getTicketsSold()) + by;
        if (event.getTotalTickets() != null && sold > event.getTotalTickets()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tickets sold out");
        }
        event.setTicketsSold(sold);
        BigDecimal currentRevenue = event.getRevenue() == null ? BigDecimal.ZERO : event.getRevenue();
        event.setRevenue(currentRevenue.add(revenueAddition));
        return eventRepository.save(event);
    }
}
