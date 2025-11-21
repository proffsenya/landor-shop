package com.example.backend.Infrastructure.Filtering;

import com.example.backend.Domain.DTOs.ProductFilter;
import com.example.backend.Domain.Models.Product;
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
    public static Specification<Product> build(ProductFilter f) {
        if (f == null || f.isEmpty()) {
            return null;
        }

        List<Specification<Product>> specs = new ArrayList<>();

        if (!f.categories.isEmpty()) {
            Set<String> lowered = f.categories.stream().map(String::toLowerCase).collect(Collectors.toSet());
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> join = root.join("categories", JoinType.LEFT);
                Expression<String> expr = cb.lower(join.get("slug"));
                return expr.in(lowered);
            });
        }

        if (!f.breeds.isEmpty()) {
            Set<String> lowered = f.breeds.stream().map(String::toLowerCase).collect(Collectors.toSet());
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> join = root.join("breeds", JoinType.LEFT);
                Expression<String> expr = cb.lower(join.get("slug"));
                return expr.in(lowered);
            });
        }

        if (!f.countries.isEmpty()) {
            Set<String> lowered = f.countries.stream().map(String::toLowerCase).collect(Collectors.toSet());
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> join = root.join("countries", JoinType.LEFT);
                Expression<String> expr = cb.lower(join.get("slug"));
                return expr.in(lowered);
            });
        }

        if (!f.typeOfFood.isEmpty()) {
            Set<String> lowered = f.typeOfFood.stream().map(String::toLowerCase).collect(Collectors.toSet());
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> join = root.join("typeoffoods", JoinType.LEFT);
                Expression<String> expr = cb.lower(join.get("slug"));
                return expr.in(lowered);
            });
        }

        if (!f.flavors.isEmpty()) {
            Set<String> lowered = f.flavors.stream().map(String::toLowerCase).collect(Collectors.toSet());
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> join = root.join("flavors", JoinType.LEFT);
                Expression<String> expr = cb.lower(join.get("canonicalName"));
                return expr.in(lowered);
            });
        }

        if (!f.brands.isEmpty()) {
            Set<String> lowered = f.brands.stream().map(String::toLowerCase).collect(Collectors.toSet());
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> join = root.join("brand", JoinType.LEFT);
                Expression<String> expr = cb.lower(join.get("slug"));
                return expr.in(lowered);
            });
        }

        if (!f.variantColors.isEmpty() || !f.variantScents.isEmpty()) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> vjoin = root.join("productVariants", JoinType.LEFT);
                Predicate p = cb.conjunction();
                if (!f.variantColors.isEmpty()) {
                    Set<String> lowered = f.variantColors.stream().map(String::toLowerCase).collect(Collectors.toSet());
                    Join<Object, Object> colorsJoin = vjoin.join("colors", JoinType.LEFT);
                    p = cb.and(p, cb.lower(colorsJoin.get("slug")).in(lowered));
                }
                if (!f.variantScents.isEmpty()) {
                    Set<String> lowered = f.variantScents.stream().map(String::toLowerCase).collect(Collectors.toSet());
                    Join<Object, Object> scentsJoin = vjoin.join("scents", JoinType.LEFT);
                    p = cb.and(p, cb.lower(scentsJoin.get("slug")).in(lowered));
                }
                return p;
            });
        }

        if (f.maxPrice != null || f.minPrice != null) {
            specs.add((root, query, cb) -> {
                if (query != null) query.distinct(true);
                Join<Object, Object> join = root.join("productVariants", JoinType.LEFT);
                Predicate p = cb.conjunction();
                if (f.minPrice != null && f.maxPrice != null) {
                    p = cb.between(join.get("price"), f.minPrice, f.maxPrice);
                }
                else if (f.minPrice != null) {
                    p = cb.greaterThanOrEqualTo(join.get("price"), f.minPrice);
                }
                else{
                    p = cb.lessThan(join.get("price"), f.maxPrice);
                }
                return p;
            });
        }



        return specs.isEmpty() ? null : Specification.allOf(specs.toArray(new Specification[0]));
    }

}
