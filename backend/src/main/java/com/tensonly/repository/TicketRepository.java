package com.tensonly.repository;

import com.tensonly.entity.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByUserId(String userId);

    List<Ticket> findByEventId(String eventId);
}
