package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.*;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Services.OrderService;
import com.example.backend.Infrastructure.Services.PaymentTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('STAFF') or hasRole('SUPERUSER')")
class PaymentController {
    private final PaymentTransactionService paymentTransactionService;
    private final OrderService orderService;
    public PaymentController(PaymentTransactionService paymentTransactionService, OrderService orderService) {
        this.paymentTransactionService = paymentTransactionService;
        this.orderService = orderService;
    }

    @GetMapping("/unpaid")
    public ResponseEntity<List<OrderDTO>> getUnpaidOrders(){
        List<OrderDTO> unpaidOrders = paymentTransactionService.getUnpaidOrders();

//        List<OrderResponseDTO> summaries = unpaidOrders.stream()
//                .map(order -> new OrderResponseDTO(
//                        order.id(),
//                        order.orderStatus(),
//                        order.totalAmount(),
//                        order.paymentStatus(),
//                        order.shippingAddress(),
//                        order.billingAddress(),
//                        order.customerNotes(),
//                        order.createdAt()
//                ))
//                .collect(Collectors.toList());

        return ResponseEntity.ok(unpaidOrders);
    }

    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<OrderDTO> confirmPayment(@PathVariable("orderId") Long orderId, @RequestBody PaymentTransactionDto dto){
        OrderDTO confirmedOrder = paymentTransactionService.confirmPayment(orderId, dto);
        return ResponseEntity.ok(confirmedOrder);
    }

    @GetMapping("/{orderId}/details")
    public ResponseEntity<OrderDTO> getOrderDetails(@PathVariable("orderId") Long orderId){
        var order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(OrderDTO.from(order));
    }

//    @PostMapping("/mock/{orderId}")
//    public ResponseEntity<ReceiptDTO> processMockPayment(
//            @PathVariable Long orderId,
//            @AuthenticationPrincipal CustomUserDetails userPrincipal,
//            @RequestBody PaymentRequest paymentRequest){
//
//        Long currentUserId = userPrincipal.getId();
//        Order order = orderService.getOrderById(orderId);
//
//        if (!order.getUser().getId().equals(currentUserId)) {
//            throw new AccessDeniedException("You are not the owner of this order");
//        }
//
//        String method = paymentRequest != null ? paymentRequest.paymentMethod() : "MOCK";
//        java.math.BigDecimal amount = paymentRequest != null ? paymentRequest.amount() : null;
//
//        var receipt = paymentTransactionService.processMockTransaction(currentUserId, orderId, method, amount);
//        return ResponseEntity.ok(receipt);
//    }

}
