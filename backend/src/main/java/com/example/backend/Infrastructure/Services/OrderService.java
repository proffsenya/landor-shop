package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.CreateOrderRequestDTO;
import com.example.backend.Domain.DTOs.OrderDTO;
import com.example.backend.Domain.Models.*;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourseNotFoundException;
import com.example.backend.Infrastructure.Repos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                 UserRepository userRepository, CartRepository cartRepository,
                 CartService cartService, ProductRepository productRepository,
                 ProductVariantRepository productVariantRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
    }

    @Transactional
    public Order createOrderFromCart(Long userId, CreateOrderRequestDTO req){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidRequestException("User not found"));
        Cart cart = cartRepository.findByUser(user).orElseThrow(() -> new InvalidRequestException("Cart not found"));
        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()){
            throw new InvalidRequestException("Cart is empty");
        }
        List<Long> selectedIds = req.cartItemIds();
        if (selectedIds == null || selectedIds.isEmpty()){
            throw new InvalidRequestException("No cart items selected for order");
        }
        Map<Long, CartItem> cartItemsById = cart.getCartItems().stream()
                .collect(Collectors.toMap(CartItem::getId, ci -> ci));

        BigDecimal totalPrice = BigDecimal.ZERO;
        for (Long cartItemId : selectedIds) {
            CartItem ci = cartItemsById.get(cartItemId);
            if (ci == null) throw new InvalidRequestException("Cart item " + cartItemId + " not found in user's cart");

            ProductVariant pv = productVariantRepository.findById(ci.getProductVariant().getId())
                    .orElseThrow(() -> new InvalidRequestException("Product variant not found"));
            if (pv.getStock() != null && pv.getStock() < ci.getQuantity()) {
                throw new InvalidRequestException("Not enough stock for variant " + pv.getId());
            }
            BigDecimal unit = ci.getPriceAtAdded() != null ? ci.getPriceAtAdded() : pv.getPrice();
            totalPrice = totalPrice.add(unit.multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderStatus("CREATED");
        order.setCreatedAt(Instant.now());
        order.setPaymentStatus("UNPAID");
        order.setCustomerNotes(req.customerNotes());
        if (req.customerSnapshot() == null){
            Map<String, Object> customerSnapshot = new HashMap<>();
            customerSnapshot.put("userId", user.getId());
            customerSnapshot.put("first_name", user.getFirstName());
            customerSnapshot.put("last_name", user.getLastName());
            customerSnapshot.put("middle_name", user.getMiddleName());
            customerSnapshot.put("email", user.getEmail());
            customerSnapshot.put("phone", user.getPhone());
            order.setCustomerSnapshot(customerSnapshot);
        }
        else{
            order.setCustomerSnapshot(req.customerSnapshot());
        }
        order.setBillingAddress(req.billingAddress());
        order.setShippingAddress(req.shippingAddress());
        order.setTotalAmount(totalPrice);

        for (Long cartItemId : selectedIds){
            CartItem cartItem = cartItemsById.get(cartItemId);
            Long variantId = cartItem.getProductVariant().getId();
            ProductVariant productVariant = productVariantRepository
                    .findByIdForUpdate(variantId).orElseThrow(() -> new InvalidRequestException("Product variant not found"));

            int qty = cartItem.getQuantity();
            BigDecimal unitPrice = cartItem.getPriceAtAdded() != null ? cartItem.getPriceAtAdded() : productVariant.getPrice();

            if (productVariant.getStock() != null && productVariant.getStock() < qty) {
                throw new InvalidRequestException("Not enough stock for variant " + variantId);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductVariant(productVariant);
            orderItem.setQuantity(qty);
            orderItem.setProductName(cartItem.getDisplayNameAtAdded());
            orderItem.setProductSku(productVariant.getSku());
            orderItem.setPrice(unitPrice);
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
            orderItem.setTotalPrice(itemTotal);

            order.getOrderItems().add(orderItem);

            if (productVariant.getStock() != null) {
                productVariant.setStock(productVariant.getStock() - qty);
                productVariantRepository.save(productVariant);
            }

            cartService.removeCartItem(userId, variantId);
            cart.getCartItems().remove(cartItem);
        }

        order = orderRepository.save(order);
        cartRepository.save(cart);

        return order;
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidRequestException("User not found"));
        List<Order> ordersList = orderRepository.findByUser(user);
        List<OrderDTO> orderDTOList = new ArrayList<>();
        for (Order order : ordersList) {
            orderDTOList.add(OrderDTO.from(order));
        }
        return orderDTOList;
    }
    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId){
        return orderRepository.findById(orderId).orElseThrow(() -> new InvalidRequestException("Order not found"));
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders(){
        List<Order> orders = orderRepository.findAll();
        List<OrderDTO> orderDTOList = new ArrayList<>();
        for (Order order : orders) {
            orderDTOList.add(OrderDTO.from(order));
        }
        return orderDTOList;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status){
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new InvalidRequestException("Order not found"));
        order.setOrderStatus(status);
        order.setUpdatedAt(Instant.now());
        return orderRepository.save(order);
    }
}
