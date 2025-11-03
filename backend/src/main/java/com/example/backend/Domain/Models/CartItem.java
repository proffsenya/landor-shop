package com.example.backend.Domain.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "cart_items")
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @NotNull
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "price_at_added", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtAdded;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Size(max = 500)
    @Column(name = "display_name_at_added", length = 500)
    private String displayNameAtAdded;

    @Size(max = 500)
    @Column(name = "image_url_at_added", length = 500)
    private String imageUrlAtAdded;

    public String getImageUrlAtAdded() {
        return imageUrlAtAdded;
    }

    public void setImageUrlAtAdded(String imageUrlAtAdded) {
        this.imageUrlAtAdded = imageUrlAtAdded;
    }

    public String getDisplayNameAtAdded() {
        return displayNameAtAdded;
    }

    public void setDisplayNameAtAdded(String displayNameAtAdded) {
        this.displayNameAtAdded = displayNameAtAdded;
    }
    public ProductVariant getProductVariant() { return productVariant; }

    public void setProductVariant(ProductVariant productVariant) { this.productVariant = productVariant; }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPriceAtAdded() {
        return priceAtAdded;
    }

    public void setPriceAtAdded(BigDecimal priceAtAdded) {
        this.priceAtAdded = priceAtAdded;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

}