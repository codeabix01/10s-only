package com.tensonly.repository;

import com.tensonly.entity.Event;
import com.tensonly.entity.EventStatus;
import com.tensonly.entity.EventVibe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {

    List<Event> findByCity(String city);

    List<Event> findByVibe(EventVibe vibe);

    List<Event> findByCityAndVibe(String city, EventVibe vibe);

    List<Event> findByHostId(String hostId);

    List<Event> findByStatus(EventStatus status);

    List<Event> findByStatusIn(List<EventStatus> statuses);

    long countByStatus(EventStatus status);
}
