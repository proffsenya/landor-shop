package com.example.backend.Application.Controllers;


import com.example.backend.Domain.DTOs.CreateOrderRequestDTO;
import com.example.backend.Domain.DTOs.OrderDTO;
import com.example.backend.Domain.DTOs.OrderResponseDTO;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;

@RestController
@Validated
@RequestMapping("/orders")
class OrderController {
    private final OrderService orderService;
    @Autowired
    public OrderController(OrderService orderService){
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@AuthenticationPrincipal CustomUserDetails userPrincipal,
                                                        @RequestBody CreateOrderRequestDTO req){
        Long userId = userPrincipal.getId();
        Order order = orderService.createOrderFromCart(userId, req.customerNotes());
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderDTO.from(order));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(@PathVariable Long orderId,
                                                     @AuthenticationPrincipal CustomUserDetails userPrincipal) throws AccessDeniedException {
        Long userId = userPrincipal.getId();
        Order order = orderService.getOrderById(orderId);

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You are not the owner of this order");
        }

        return ResponseEntity.ok(OrderDTO.from(order));
    }
}
