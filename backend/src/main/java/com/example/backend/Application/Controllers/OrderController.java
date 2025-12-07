package com.example.backend.Application.Controllers;


import com.example.backend.Domain.DTOs.CreateOrderRequestDTO;
import com.example.backend.Domain.DTOs.OrderDTO;
import com.example.backend.Domain.DTOs.OrderResponseDTO;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
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
        Order order = orderService.createOrderFromCart(userId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderDTO.from(order));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderByIdByUser(@PathVariable Long orderId,
                                                     @AuthenticationPrincipal CustomUserDetails userPrincipal) throws AccessDeniedException {
        Long userId = userPrincipal.getId();
        Order order = orderService.getOrderById(orderId);

        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("You are not the owner of this order");
        }

        return ResponseEntity.ok(OrderDTO.from(order));
    }

    @GetMapping("/profile")
    public ResponseEntity<List<OrderDTO>> getAllOrdersByUser(@AuthenticationPrincipal CustomUserDetails userPrincipal) throws AccessDeniedException{
        Long userId = userPrincipal.getId();
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));

    }

    @GetMapping
    @PreAuthorize("hasRole('STAFF') or hasRole('SUPERUSER')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{orderId}")
    @PreAuthorize("hasRole('STAFF') or hasRole('SUPERUSER')")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable Long orderId, @RequestBody String status
                                                ) throws AccessDeniedException {
        Order order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(OrderDTO.from(order));
    }


}
