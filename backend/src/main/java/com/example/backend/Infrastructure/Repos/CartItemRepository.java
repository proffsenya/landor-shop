package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Cart;
import com.example.backend.Domain.Models.CartItem;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    CartItem findByCartAndProductVariant(Cart cart, ProductVariant productVariant);
    List<CartItem> findByCart(Cart cart);
    void deleteAllByCart(Cart cart);
}