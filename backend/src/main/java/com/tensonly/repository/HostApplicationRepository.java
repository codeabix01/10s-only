package com.tensonly.repository;

import com.tensonly.entity.HostApplication;
import com.tensonly.entity.HostApplicationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostApplicationRepository extends MongoRepository<HostApplication, String> {

    List<HostApplication> findByUserId(String userId);

    List<HostApplication> findByStatus(HostApplicationStatus status);

    List<HostApplication> findAllByOrderBySubmittedAtDesc();
}
