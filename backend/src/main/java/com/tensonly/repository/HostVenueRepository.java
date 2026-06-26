package com.tensonly.repository;

import com.tensonly.entity.HostVenue;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HostVenueRepository extends MongoRepository<HostVenue, String> {
}
