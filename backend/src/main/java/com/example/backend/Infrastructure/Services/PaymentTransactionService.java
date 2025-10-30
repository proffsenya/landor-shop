package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.ReceiptDTO;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Domain.Models.PaymentTransaction;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.OrderRepository;
import com.example.backend.Infrastructure.Repos.PaymentTransactionRepository;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentTransactionService {
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    public PaymentTransactionService(PaymentTransactionRepository paymentTransactionRepository,
                                     OrderRepository orderRepository, UserRepository userRepository,
                                     OrderService orderService) {
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
    }

    public ReceiptDTO processMockTransaction(Long userId, Long orderId, String paymentMethod, BigDecimal requestedAmount) {
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidRequestException("User not found: payment is impossible"));
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new InvalidRequestException("Order not found"));
        if (!orderService.getOrdersByUserId(userId).contains(order)) {
            throw new InvalidRequestException("Order does not belong to this user");
        }

        if ("PAID".equalsIgnoreCase(order.getPaymentStatus())) {
            return paymentTransactionRepository
                    .findFirstByOrderAndPaymentStatusOrderByCreatedAtDesc(order, "SUCCESS")
                    .map(pt -> mapToReceipt(order, pt))
                    .orElseThrow(() -> new InvalidRequestException("Order is already paid but no transaction found"));
        }

        BigDecimal expected = order.getTotalAmount();
        if (requestedAmount != null && requestedAmount.compareTo(expected) != 0) {
            throw new InvalidRequestException("Requested amount does not match order total");
        }

        PaymentTransaction tx = new PaymentTransaction();
        tx.setOrder(order);
        tx.setAmount(expected);
        tx.setPaymentMethod(paymentMethod != null ? paymentMethod : "MOCK");
        tx.setPaymentStatus("SUCCESS");
        tx.setTransactionId(UUID.randomUUID().toString());
        tx.setPaymentGatewayResponse("MOCK_OK");
        tx.setCreatedAt(Instant.now());

        tx = paymentTransactionRepository.save(tx);

        order.setPaymentStatus("PAID");
        order.setOrderStatus("PAID");
        order.setUpdatedAt(Instant.now());
        orderRepository.save(order);

        return mapToReceipt(order, tx);

    }

    private ReceiptDTO mapToReceipt(Order order, PaymentTransaction tx) {
        return new ReceiptDTO(
                order.getId(),
                tx.getTransactionId(),
                tx.getAmount(),
                tx.getPaymentMethod(),
                tx.getPaymentStatus(),
                tx.getCreatedAt()
        );
    }
}
