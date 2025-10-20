package com.example.backend.Domain.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProductBreedId implements Serializable {
    private static final long serialVersionUID = 4526219829055537536L;
    @NotNull
    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @NotNull
    @Column(name = "breed_id", nullable = false)
    private Integer breedId;

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getBreedId() {
        return breedId;
    }

    public void setBreedId(Integer breedId) {
        this.breedId = breedId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ProductBreedId entity = (ProductBreedId) o;
        return Objects.equals(this.productId, entity.productId) &&
                Objects.equals(this.breedId, entity.breedId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, breedId);
    }

}