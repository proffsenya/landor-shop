package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.OrderDTO;
import com.example.backend.Domain.DTOs.PaymentTransactionDto;
import com.example.backend.Domain.DTOs.ReceiptDTO;
import com.example.backend.Domain.Models.Order;
import com.example.backend.Domain.Models.PaymentTransaction;
import com.example.backend.Domain.Models.User;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.OrderRepository;
import com.example.backend.Infrastructure.Repos.PaymentTransactionRepository;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
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

    @Transactional(readOnly = true)
    public List<OrderDTO> getUnpaidOrders() {
        return orderRepository.findByPaymentStatus("UNPAID").stream()
                .map(order -> OrderDTO.from(order)).toList();
    }

    @Transactional
    public OrderDTO confirmPayment(Long orderId, PaymentTransactionDto ptDto) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new InvalidRequestException("Order not found"));

        if ("PAID".equals(order.getPaymentStatus())) {
            throw new InvalidRequestException("Payment status is PAID");
        }

        if (ptDto.amount() != null){
            if (ptDto.amount().compareTo(order.getTotalAmount()) != 0){
                throw new InvalidRequestException("Amount not enough");
            }
        }

        PaymentTransaction transaction= new PaymentTransaction();
        transaction.setOrder(order);
        transaction.setAmount(order.getTotalAmount());
        transaction.setPaymentMethod(ptDto.paymentMethod() != null ? ptDto.paymentMethod() : "MANUAL");
        transaction.setPaymentStatus("SUCCESS");
        transaction.setTransactionId("MANUAL-" + UUID.randomUUID().toString().substring(0, 8));
        transaction.setPaymentGatewayResponse("Confirmed manually");
        transaction.setCreatedAt(Instant.now());

        paymentTransactionRepository.save(transaction);

        order.setPaymentStatus("PAID");
        order.setOrderStatus("PROCESSING");
        order.setUpdatedAt(Instant.now());

        orderRepository.save(order);

        return OrderDTO.from(order);
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
