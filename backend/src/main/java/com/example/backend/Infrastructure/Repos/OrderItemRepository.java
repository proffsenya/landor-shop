package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}