package com.tensonly.repository;

import com.tensonly.entity.Application;
import com.tensonly.entity.ApplicationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    List<Application> findByStatus(ApplicationStatus status);

    List<Application> findByStatusOrderByIdDesc(ApplicationStatus status);

    @Query(value = "{ 'emailOrPhone': ?0 }", sort = "{ 'submittedAt': -1 }")
    List<Application> findByEmailOrPhoneOrderBySubmittedAtDesc(String emailOrPhone);

    long countByStatus(ApplicationStatus status);

    @Query(value = "{ 'emailOrPhone': ?0, 'status': ?1 }", exists = true)
    boolean existsByEmailOrPhoneAndStatus(String emailOrPhone, ApplicationStatus status);
}
