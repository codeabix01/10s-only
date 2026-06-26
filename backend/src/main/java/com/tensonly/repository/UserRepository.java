package com.tensonly.repository;

import com.tensonly.entity.Role;
import com.tensonly.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    @Query("{ 'emailOrPhone': ?0 }")
    Optional<User> findByEmailOrPhone(String emailOrPhone);

    long countByRole(Role role);

    long countByApprovedTrue();

    List<User> findByRole(Role role);
}
