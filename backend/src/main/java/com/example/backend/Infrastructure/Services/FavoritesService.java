package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.VariantCardDTO;
import com.example.backend.Domain.Models.*;
import com.example.backend.Infrastructure.Exceptions.InvalidResourseException;
import com.example.backend.Infrastructure.Repos.FavoriteRepository;
import com.example.backend.Infrastructure.Repos.ProductVariantRepository;
import com.example.backend.Infrastructure.Repos.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.attribute.UserPrincipalNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FavoritesService {
    private final FavoriteRepository favoriteRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ProductService productService;

    public FavoritesService(FavoriteRepository favoriteRepository, ProductVariantRepository productVariantRepository,
                            UserRepository userRepository, CartService cartService, ProductService productService) {
        this.favoriteRepository = favoriteRepository;
        this.productVariantRepository = productVariantRepository;
        this.userRepository = userRepository;
        this.cartService = cartService;
        this.productService = productService;
    }

    @Transactional
    public VariantCardDTO addToFavorites(Long userId, Long variantId){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidResourseException("User not found"));
        ProductVariant variant = productVariantRepository.findById(variantId).orElseThrow(() -> new InvalidResourseException("Variant not found"));

        favoriteRepository.findByUserAndProductVariant(user, variant)
                .ifPresent(f -> { });

        if (!favoriteRepository.existsByUserAndProductVariant(user, variant)) {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setProductVariant(variant);
            favoriteRepository.save(favorite);
        }

        return toVariantCardDTO(variant);
    }

    @Transactional
    public void removeFromFavorites(Long userId, Long variantId){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidResourseException("User not found"));
        ProductVariant variant = productVariantRepository.findById(variantId).orElseThrow(() -> new InvalidResourseException("Variant not found"));
        favoriteRepository.deleteByUserAndProductVariant(user, variant);
    }

    @Transactional(readOnly = true)
    public List<VariantCardDTO> getFavorites(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidResourseException("User not found"));
        return favoriteRepository.findAllByUser(user)
                .stream().map(Favorite::getProductVariant)
                .map(this::toVariantCardDTO)
                .toList();
    }

    @Transactional
    public void clearFavorites(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new InvalidResourseException("User not found"));
        favoriteRepository.deleteAllByUser(user);
    }

    private VariantCardDTO toVariantCardDTO(ProductVariant v) {
        Product product = v.getProduct();
        return productService.toVariantCardDTO(v);
    }

    public static record MoveResult(List<Long> moved, List<Long> skipped, List<String> errors) {}

    @Transactional
    public MoveResult moveFavoritesToCartByUsername(Long userId, List<Long> variantIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidResourseException("User not found"));

        if (variantIds == null || variantIds.isEmpty()) {
            return new MoveResult(List.of(), List.of(), List.of());
        }

        List<ProductVariant> variants = productVariantRepository.findAllById(variantIds);

        List<Long> moved = new ArrayList<>();
        List<Long> skipped = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long vid : variantIds) {
            ProductVariant v = variants.stream().filter(x -> x.getId().equals(vid)).findFirst().orElse(null);
            if (v == null) {
                skipped.add(vid);
                errors.add("Variant not found: " + vid);
                continue;
            }

            try {
                cartService.addProductVariantToCart(user.getId(), vid, 1);
                moved.add(vid);
            } catch (Exception ex) {
                errors.add("Failed to add variant " + vid + ": " + ex.getMessage());
            }
        }

        if (!moved.isEmpty()) {
            favoriteRepository.deleteAllByUserAndProductVariantIdIn(user, moved);
        }

        return new MoveResult(moved, skipped, errors);
    }

}
