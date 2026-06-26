package com.tensonly.repository;

import com.tensonly.entity.Confession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfessionRepository extends MongoRepository<Confession, String> {

    List<Confession> findByEventIdOrderByCreatedAtDesc(String eventId);
}
