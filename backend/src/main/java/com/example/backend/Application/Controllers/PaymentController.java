package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.PaymentRequest;
import com.example.backend.Domain.DTOs.ReceiptDTO;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Services.OrderService;
import com.example.backend.Infrastructure.Services.PaymentTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
class PaymentController {
    private final PaymentTransactionService paymentTransactionService;
    private final OrderService orderService;
    public PaymentController(PaymentTransactionService paymentTransactionService, OrderService orderService) {
        this.paymentTransactionService = paymentTransactionService;
        this.orderService = orderService;
    }

    @PostMapping("/mock/{orderId}")
    public ResponseEntity<ReceiptDTO> processMockPayment(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userPrincipal,
            @RequestBody PaymentRequest paymentRequest){

        Long currentUserId = userPrincipal.getId();
        Order order = orderService.getOrderById(orderId);

        if (!order.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You are not the owner of this order");
        }

        String method = paymentRequest != null ? paymentRequest.paymentMethod() : "MOCK";
        java.math.BigDecimal amount = paymentRequest != null ? paymentRequest.amount() : null;

        var receipt = paymentTransactionService.processMockTransaction(currentUserId, orderId, method, amount);
        return ResponseEntity.ok(receipt);
    }

}
