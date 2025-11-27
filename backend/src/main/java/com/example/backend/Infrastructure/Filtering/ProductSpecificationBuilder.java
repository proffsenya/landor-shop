package com.example.backend.Infrastructure.Filtering;

import com.example.backend.Domain.DTOs.ProductFilter;
import com.example.backend.Domain.Models.*;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ProductSpecificationBuilder {
    public static Specification<ProductVariant> build(ProductFilter f) {
        if (f == null || f.isEmpty()) {
            return null;
        }

        List<Specification<ProductVariant>> specs = new ArrayList<>();

        if (!f.categories.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<ProductVariant, Product> product = root.join("product");
                Join<Product, Category> categories = product.join("categories");
                Expression<String> expr = cb.lower(categories.get("slug"));
                Set<String> lowered = f.categories.stream().map(String::toLowerCase).collect(Collectors.toSet());
                return expr.in(lowered);
            });
        }

        if (!f.breeds.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<ProductVariant, Product> product = root.join("product");
                Join<Product, Breed> breeds = product.join("breeds");
                Expression<String> expr = cb.lower(breeds.get("slug"));
                Set<String> lowered = f.breeds.stream().map(String::toLowerCase).collect(Collectors.toSet());
                return expr.in(lowered);
            });
        }

        if (!f.countries.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<ProductVariant, Product> product = root.join("product");
                Join<Product, Country> countries = product.join("countries");
                Expression<String> expr = cb.lower(countries.get("slug"));
                Set<String> lowered = f.countries.stream().map(String::toLowerCase).collect(Collectors.toSet());
                return expr.in(lowered);
            });
        }

        if (!f.typeOfFood.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<ProductVariant, Product> product = root.join("product");
                Join<Product, Typeoffood> typeoffoods = product.join("typeoffoods");
                Expression<String> expr = cb.lower(typeoffoods.get("slug"));
                Set<String> lowered = f.typeOfFood.stream().map(String::toLowerCase).collect(Collectors.toSet());
                return expr.in(lowered);
            });
        }

        if (!f.flavors.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<ProductVariant, Product> product = root.join("product");
                Join<Product, Flavor> flavors = product.join("flavors");
                Expression<String> expr = cb.lower(flavors.get("canonicalName"));
                Set<String> lowered = f.flavors.stream().map(String::toLowerCase).collect(Collectors.toSet());
                return expr.in(lowered);
            });
        }

        if (!f.productTypes.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<ProductVariant, Product> product = root.join("product");
                Join<Product, ProductType> types = product.join("productType");
                Expression<String> expr = cb.lower(types.get("slug"));
                Set<String> lowered = f.productTypes.stream().map(String::toLowerCase).collect(Collectors.toSet());
                return expr.in(lowered);
            });
        }

        if (!f.brands.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<ProductVariant, Product> product = root.join("product");
                Join<Product, Brand> brands = product.join("brand");
                Expression<String> expr = cb.lower(brands.get("slug"));
                Set<String> lowered = f.brands.stream().map(String::toLowerCase).collect(Collectors.toSet());
                return expr.in(lowered);
            });
        }

        if (!f.variantColors.isEmpty() || !f.variantScents.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Predicate p = cb.conjunction();
                if (!f.variantColors.isEmpty()) {
                    Set<String> lowered = f.variantColors.stream().map(String::toLowerCase).collect(Collectors.toSet());
                    Join<Object, Object> colorsJoin = root.join("colors", JoinType.LEFT);
                    p = cb.and(p, cb.lower(colorsJoin.get("slug")).in(lowered));
                }
                if (!f.variantScents.isEmpty()) {
                    Set<String> lowered = f.variantScents.stream().map(String::toLowerCase).collect(Collectors.toSet());
                    Join<Object, Object> scentsJoin = root.join("scents", JoinType.LEFT);
                    p = cb.and(p, cb.lower(scentsJoin.get("slug")).in(lowered));
                }
                return p;
            });
        }

        if (f.maxPrice != null || f.minPrice != null) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                if (f.minPrice != null && f.maxPrice != null) {
                    return cb.between(root.get("price"), f.minPrice, f.maxPrice);
                }
                else if (f.minPrice != null) {
                    return cb.greaterThanOrEqualTo(root.get("price"), f.minPrice);
                }
                else{
                    return cb.lessThan(root.get("price"), f.maxPrice);
                }
            });
        }



        return specs.isEmpty() ? null : Specification.allOf(specs.toArray(new Specification[0]));
    }

}
