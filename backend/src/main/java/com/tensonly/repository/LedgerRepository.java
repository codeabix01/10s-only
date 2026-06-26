package com.tensonly.repository;

import com.tensonly.entity.LedgerEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LedgerRepository extends MongoRepository<LedgerEntry, String> {

    List<LedgerEntry> findByEventIdOrderByTimestampDesc(String eventId);
}
