package com.tensonly.dto;

import com.tensonly.entity.Event;
import com.tensonly.entity.EventStatus;
import com.tensonly.entity.EventVibe;
import com.tensonly.entity.EventVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.data.geo.GeoResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class EventDto {

    private String id;
    private String title;
    private EventVibe vibe;
    private String city;
    private String venueName;
    private String venueAddress;
    private Integer venueCapacity;
    private Instant startAt;
    private Instant endAt;
    private BigDecimal ticketPrice;
    private Integer totalTickets;
    private Integer ticketsSold;
    private BigDecimal revenue;
    private String description;
    private List<String> lineup;
    private String coverImage;
    private EventVisibility visibility;
    private EventStatus status;
    private String rejectionReason;
    private String hostId;
    private HostDto host;
    private Instant createdAt;
    private Double distanceKm;
    private Double latitude;
    private Double longitude;

    public EventDto() {
    }

    public static EventDto from(Event e) {
        EventDto dto = new EventDto();
        dto.id = e.getId();
        dto.title = e.getTitle();
        dto.vibe = e.getVibe();
        dto.city = e.getCity();
        dto.venueName = e.getVenueName();
        dto.venueAddress = e.getVenueAddress();
        dto.venueCapacity = e.getVenueCapacity();
        dto.startAt = e.getStartAt();
        dto.endAt = e.getEndAt();
        dto.ticketPrice = e.getTicketPrice();
        dto.totalTickets = e.getTotalTickets();
        dto.ticketsSold = e.getTicketsSold();
        dto.revenue = e.getRevenue();
        dto.description = e.getDescription();
        dto.lineup = e.getLineup();
        dto.coverImage = e.getCoverImage();
        dto.visibility = e.getVisibility();
        dto.status = e.getStatus();
        dto.rejectionReason = e.getRejectionReason();
        dto.hostId = e.getHostId();
        dto.host = new HostDto(e.getHostId(), e.getHostName());
        dto.createdAt = e.getCreatedAt();
        if (e.getLocation() != null) {
            dto.latitude  = e.getLocation().getY();
            dto.longitude = e.getLocation().getX();
        }
        return dto;
    }

    public static EventDto from(GeoResult<Event> gr) {
        EventDto dto = from(gr.getContent());
        dto.distanceKm = gr.getDistance().getValue();
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public EventVibe getVibe() { return vibe; }
    public void setVibe(EventVibe vibe) { this.vibe = vibe; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public String getVenueAddress() { return venueAddress; }
    public void setVenueAddress(String venueAddress) { this.venueAddress = venueAddress; }

    public Integer getVenueCapacity() { return venueCapacity; }
    public void setVenueCapacity(Integer venueCapacity) { this.venueCapacity = venueCapacity; }

    public Instant getStartAt() { return startAt; }
    public void setStartAt(Instant startAt) { this.startAt = startAt; }

    public Instant getEndAt() { return endAt; }
    public void setEndAt(Instant endAt) { this.endAt = endAt; }

    public BigDecimal getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }

    public Integer getTotalTickets() { return totalTickets; }
    public void setTotalTickets(Integer totalTickets) { this.totalTickets = totalTickets; }

    public Integer getTicketsSold() { return ticketsSold; }
    public void setTicketsSold(Integer ticketsSold) { this.ticketsSold = ticketsSold; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getLineup() { return lineup; }
    public void setLineup(List<String> lineup) { this.lineup = lineup; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public EventVisibility getVisibility() { return visibility; }
    public void setVisibility(EventVisibility visibility) { this.visibility = visibility; }

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getHostId() { return hostId; }
    public void setHostId(String hostId) { this.hostId = hostId; }

    public HostDto getHost() { return host; }
    public void setHost(HostDto host) { this.host = host; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public static class HostDto {
        private String id;
        private String name;

        public HostDto() {
        }

        public HostDto(String id, String name) {
            this.id = id;
            this.name = name;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class CreateRequest {
        @NotBlank
        private String title;

        @NotNull
        private EventVibe vibe;

        @NotBlank
        private String city;

        private String venueName;
        private String venueAddress;
        private Integer venueCapacity;

        @NotNull
        private Instant startAt;

        private Instant endAt;

        @NotNull
        @PositiveOrZero
        private BigDecimal ticketPrice;

        @NotNull
        @Positive
        private Integer totalTickets;

        private String description;
        private List<String> lineup;
        private String coverImage;
        private EventVisibility visibility;
        private Double latitude;
        private Double longitude;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public EventVibe getVibe() { return vibe; }
        public void setVibe(EventVibe vibe) { this.vibe = vibe; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getVenueName() { return venueName; }
        public void setVenueName(String venueName) { this.venueName = venueName; }

        public String getVenueAddress() { return venueAddress; }
        public void setVenueAddress(String venueAddress) { this.venueAddress = venueAddress; }

        public Integer getVenueCapacity() { return venueCapacity; }
        public void setVenueCapacity(Integer venueCapacity) { this.venueCapacity = venueCapacity; }

        public Instant getStartAt() { return startAt; }
        public void setStartAt(Instant startAt) { this.startAt = startAt; }

        public Instant getEndAt() { return endAt; }
        public void setEndAt(Instant endAt) { this.endAt = endAt; }

        public BigDecimal getTicketPrice() { return ticketPrice; }
        public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }

        public Integer getTotalTickets() { return totalTickets; }
        public void setTotalTickets(Integer totalTickets) { this.totalTickets = totalTickets; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public List<String> getLineup() { return lineup; }
        public void setLineup(List<String> lineup) { this.lineup = lineup; }

        public String getCoverImage() { return coverImage; }
        public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

        public EventVisibility getVisibility() { return visibility; }
        public void setVisibility(EventVisibility visibility) { this.visibility = visibility; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }
}
