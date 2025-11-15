package com.example.backend.Domain.DTOs;

import java.util.HashSet;
import java.util.Set;

public class ProductFilter {
    public Set<String> categories = new HashSet<>();
    public Set<String> breeds = new HashSet<>();
    public Set<String> countries = new HashSet<>();
    public Set<String> typeOfFood = new HashSet<>();
    public Set<String> flavors = new HashSet<>();
    public Set<String> brands = new HashSet<>(); // бренд как slug/name
    public Set<String> variantColors = new HashSet<>();
    public Set<String> variantScents = new HashSet<>();

    public boolean isEmpty() {
        return categories.isEmpty() && breeds.isEmpty() && countries.isEmpty()
                && typeOfFood.isEmpty() && flavors.isEmpty() && brands.isEmpty()
                && variantColors.isEmpty() && variantScents.isEmpty();
    }
}
