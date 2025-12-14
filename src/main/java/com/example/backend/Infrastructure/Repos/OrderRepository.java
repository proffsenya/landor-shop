package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.DTOs.OrderDTO;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Domain.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    List<Order> findByPaymentStatus(String paymentStatus);
}