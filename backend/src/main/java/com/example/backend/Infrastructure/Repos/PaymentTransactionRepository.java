package com.example.backend.Infrastructure.Repos;

import aj.org.objectweb.asm.commons.Remapper;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Domain.Models.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    Optional<PaymentTransaction> findFirstByOrderAndPaymentStatusOrderByCreatedAtDesc(Order order, String success);
}