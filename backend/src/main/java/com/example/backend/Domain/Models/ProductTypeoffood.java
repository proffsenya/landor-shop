package com.example.backend.Domain.Models;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "product_typeoffood")
public class ProductTypeoffood {
    @EmbeddedId
    private ProductTypeoffoodId id;

    @MapsId("productId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @MapsId("typeoffoodId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "typeoffood_id", nullable = false)
    private Typeoffood typeoffood;

    public ProductTypeoffoodId getId() {
        return id;
    }

    public void setId(ProductTypeoffoodId id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Typeoffood getTypeoffood() {
        return typeoffood;
    }

    public void setTypeoffood(Typeoffood typeoffood) {
        this.typeoffood = typeoffood;
    }

}