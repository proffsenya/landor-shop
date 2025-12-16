package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.Cart;
import com.example.backend.Domain.Models.CartItem;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Domain.Models.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    CartItem findByCartAndProductVariant(Cart cart, ProductVariant productVariant);
    List<CartItem> findByCart(Cart cart);
    void deleteAllByCart(Cart cart);

    @Modifying
    @Query("update CartItem ci set ci.quantity = ci.quantity + :delta where ci.cart.id = :cartId and ci.productVariant.id = :variantId and (ci.quantity + :delta) > 0")
    int changeQuantityIfResultPositive(@Param("cartId") Long cartId,
                                       @Param("variantId") Long variantId,
                                       @Param("delta") int delta);

    @Modifying
    @Query("delete from CartItem ci where ci.cart.id = :cartId and ci.productVariant.id = :variantId and ci.quantity <= 0")
    int deleteIfQuantityNonPositive(@Param("cartId") Long cartId,
                                    @Param("variantId") Long variantId);

}