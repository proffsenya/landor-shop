package com.example.backend.Application.Controllers;


import com.example.backend.Domain.DTOs.CreateOrderRequestDTO;
import com.example.backend.Domain.DTOs.OrderDTO;
import com.example.backend.Domain.DTOs.OrderUpdateDTO;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Services.EmailService;
import com.example.backend.Infrastructure.Services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.file.AccessDeniedException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@Validated
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
class OrderController {
    private final OrderService orderService;
    private final EmailService emailService;
    
    @Autowired
    public OrderController(OrderService orderService, EmailService emailService){
        this.orderService = orderService;
        this.emailService = emailService;
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@AuthenticationPrincipal CustomUserDetails userPrincipal,
                                                        @RequestBody CreateOrderRequestDTO req){
        Long userId = userPrincipal.getId();
        Order order = orderService.createOrderFromCart(userId, req);
        
        // Отправляем email уведомление о новом заказе
        Map<String, Object> customerSnapshot = order.getCustomerSnapshot();
        String customerName = "";
        String customerEmail = "";
        String customerPhone = "";
        
        if (customerSnapshot != null) {
            customerName = String.format("%s %s %s",
                customerSnapshot.getOrDefault("first_name", ""),
                customerSnapshot.getOrDefault("middle_name", ""),
                customerSnapshot.getOrDefault("last_name", "")
            ).trim();
            customerEmail = String.valueOf(customerSnapshot.getOrDefault("email", ""));
            customerPhone = String.valueOf(customerSnapshot.getOrDefault("phone", ""));
        }
        
        BigDecimal totalAmount = order.getTotalAmount();
        String totalAmountStr = totalAmount != null ? totalAmount.toString() + " руб." : "0 руб.";
        String paymentMethod = order.getPaymentMethod() != null ? order.getPaymentMethod() : "Не указан";
        String deliveryMethod = order.getDeliveryMethod() != null ? order.getDeliveryMethod() : "Не указан";
        String customerNotes = order.getCustomerNotes() != null ? order.getCustomerNotes() : "";
        
        // Получаем список товаров из заказа
        List<com.example.backend.Domain.Models.OrderItem> orderItems = new ArrayList<>(order.getOrderItems());
        
        emailService.sendOrderEmail(
            order.getId(),
            customerName.isEmpty() ? "Не указано" : customerName,
            customerEmail.isEmpty() ? "Не указан" : customerEmail,
            customerPhone.isEmpty() ? "Не указан" : customerPhone,
            totalAmountStr,
            paymentMethod,
            deliveryMethod,
            customerNotes,
            orderItems
        );
        
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
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId, @RequestBody String status
                                                ) throws AccessDeniedException {
        Order order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(OrderDTO.from(order));
    }

    @PutMapping("/{orderId}/changedetails")
    @PreAuthorize("hasRole('STAFF') or hasRole('SUPERUSER')")
    public ResponseEntity<OrderDTO> updateOrderByOrderId(@PathVariable Long orderId, @RequestBody OrderUpdateDTO dto) {
        Order newOrder = orderService.updateOrder(orderId, dto);
        return ResponseEntity.ok(OrderDTO.from(newOrder));
    }

}
