package com.tensonly.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "host_venues")
public class HostVenue {

    @Id
    private String id;

    private String name;

    @Indexed
    private String city;

    private String address;

    private Integer capacity;

    private Integer pastEventsCount;

    private BigDecimal rating;

    public HostVenue() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getPastEventsCount() { return pastEventsCount; }
    public void setPastEventsCount(Integer pastEventsCount) { this.pastEventsCount = pastEventsCount; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
}
