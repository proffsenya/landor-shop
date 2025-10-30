package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.*;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourseNotFoundException;
import com.example.backend.Infrastructure.Repos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;

    OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                 UserRepository userRepository, CartRepository cartRepository,
                 CartService cartService, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.productRepository = productRepository;
    }

    @Transactional
    public Order createOrderFromCart(Long userId, String notes){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidRequestException("User not found"));
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> new InvalidRequestException("Cart not found"));
        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()){
            throw new InvalidRequestException("Cart is empty");
        }


        Order order = new Order();
        order.setUser(user);
        order.setOrderStatus("CREATED");
        order.setCreatedAt(Instant.now());
        order.setPaymentStatus("UNPAID");
        order.setCustomerNotes(notes);

        order = orderRepository.save(order);

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getCartItems()){
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new InvalidRequestException("Product not found" + cartItem.getProduct().getId()));

            int qty = cartItem.getQuantity();
            BigDecimal unitPrice = cartItem.getPriceAtAdded();
            if(unitPrice == null){
                unitPrice = product.getPrice();
            }

            try {
                Integer stock = product.getQuantityInStock();
                if (stock != null && stock < qty){
                    throw new  InvalidRequestException("Product quantity exceeds stock");
                }
            }
            catch (ResourseNotFoundException exception) {
                throw new  InvalidRequestException("Stock of product is null" + cartItem.getProduct().getId());
            }

            OrderItem  orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(qty);
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setProductSku(cartItem.getProduct().getSku());
            orderItem.setPrice(unitPrice);
            order.getOrderItems().add(orderItem);
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
            orderItem.setTotalPrice(itemTotal);
            orderItem = orderItemRepository.save(orderItem);

            order.getOrderItems().add(orderItem);
            totalPrice = totalPrice.add(itemTotal);

            if (product.getQuantityInStock() != null) {
                product.setQuantityInStock(product.getQuantityInStock() - qty);
                productRepository.save(product);
            }
        }

        order.setTotalAmount(totalPrice);
        order.setUpdatedAt(Instant.now());
        order = orderRepository.save(order);
        cartService.clearCart(userId);

        return order;
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByUserId(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidRequestException("User not found"));
        return orderRepository.findByUser(user);
    }
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId){
        return orderRepository.findById(orderId).orElseThrow(() -> new InvalidRequestException("Order not found"));
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status){
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new InvalidRequestException("Order not found"));
        order.setOrderStatus(status);
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }
}
