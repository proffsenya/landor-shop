package com.example.backend.Domain.Models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ProductTypeoffoodId implements Serializable {
    private static final long serialVersionUID = -1436240518024185784L;
    @NotNull
    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @NotNull
    @Column(name = "typeoffood_id", nullable = false)
    private Integer typeoffoodId;

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getTypeoffoodId() {
        return typeoffoodId;
    }

    public void setTypeoffoodId(Integer typeoffoodId) {
        this.typeoffoodId = typeoffoodId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ProductTypeoffoodId entity = (ProductTypeoffoodId) o;
        return Objects.equals(this.productId, entity.productId) &&
                Objects.equals(this.typeoffoodId, entity.typeoffoodId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(productId, typeoffoodId);
    }

}