package com.example.backend.Domain.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProductCountryId implements Serializable {
    private static final long serialVersionUID = -492115182669208196L;
    @NotNull
    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @NotNull
    @Column(name = "country_id", nullable = false)
    private Integer countryId;

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getCountryId() {
        return countryId;
    }

    public void setCountryId(Integer countryId) {
        this.countryId = countryId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ProductCountryId entity = (ProductCountryId) o;
        return Objects.equals(this.productId, entity.productId) &&
                Objects.equals(this.countryId, entity.countryId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, countryId);
    }

}