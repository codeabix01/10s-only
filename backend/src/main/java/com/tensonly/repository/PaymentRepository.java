package com.tensonly.repository;

import com.tensonly.entity.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    boolean existsByOrderId(String orderId);

    boolean existsByPaymentId(String paymentId);

    Optional<Payment> findByOrderId(String orderId);

    Optional<Payment> findByPaymentId(String paymentId);
}
