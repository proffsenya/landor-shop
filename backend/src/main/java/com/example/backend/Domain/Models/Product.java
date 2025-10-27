package com.example.backend.Domain.Models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 100)
    @Column(name = "name", length = 100)
    private String name;

    @Size(max = 1000)
    @Column(name = "description", length = 1000)
    private String description;

    @Size(max = 100)
    @Column(name = "slug", length = 100)
    private String slug;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock;

    @Size(max = 255)
    @NotNull
    @Column(name = "sku", nullable = false)
    private String sku;

    @NotNull
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "old_price", precision = 10, scale = 2)
    private BigDecimal oldPrice;

    @ColumnDefault("true")
    @Column(name = "is_active")
    private Boolean isActive;

    @ColumnDefault("false")
    @Column(name = "is_featured")
    private Boolean isFeatured;

    @ColumnDefault("0.00")
    @Column(name = "rating", precision = 3, scale = 2)
    private BigDecimal rating;

    @OneToMany(mappedBy = "product")
    private Set<CartItem> cartItems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product")
    private Set<OrderItem> orderItems = new LinkedHashSet<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ProductImage> images = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "product_breeds",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "breed_id")
    )
    private Set<Breed> breeds = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "product_categories",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "product_countries",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "country_id")
    )
    private Set<Country> countries = new LinkedHashSet<>();

    @ManyToMany
    @JoinTable(
            name = "product_typeoffood",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "typeoffood_id")
    )
    private Set<Typeoffood> typeoffoods = new LinkedHashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public Integer getQuantityInStock() {
        return quantityInStock;
    }

    public void setQuantityInStock(Integer quantityInStock) {
        this.quantityInStock = quantityInStock;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getOldPrice() {
        return oldPrice;
    }

    public void setOldPrice(BigDecimal oldPrice) {
        this.oldPrice = oldPrice;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public Set<CartItem> getCartItems() {
        return cartItems;
    }

    public void setCartItems(Set<CartItem> cartItems) {
        this.cartItems = cartItems;
    }

    public Set<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(Set<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public Set<Breed> getBreeds() {
        return breeds;
    }

    public void setBreeds(Set<Breed> breeds) {
        this.breeds = breeds;
    }

    public Set<Category> getCategories() {
        return categories;
    }

    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }

    public Set<Country> getCountries() {
        return countries;
    }

    public void setCountries(Set<Country> countries) {
        this.countries = countries;
    }

    public Set<Typeoffood> getTypeoffoods() {
        return typeoffoods;
    }

    public void setTypeoffoods(Set<Typeoffood> typeoffoods) {
        this.typeoffoods = typeoffoods;
    }

    public Set<ProductImage> getImages() {
        return images;
    }
    public void setImages(Set<ProductImage> images) {
        this.images = images;
    }
    public void addImage(ProductImage img) {
        images.add(img);
        img.setProduct(this);
    }
    public void removeImage(ProductImage img) {
        images.remove(img);
        img.setProduct(null);
    }

}