package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.VariantCardDTO;
import com.example.backend.Infrastructure.Configurations.CustomUserDetails;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Services.FavoritesService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    private final FavoritesService favoritesService;
    public FavoriteController(FavoritesService favoritesService) {
        this.favoritesService = favoritesService;
    }

    public record VariantIdDTO(@NotNull Long variantId) {}

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<VariantCardDTO> addToFavorites(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody @Valid VariantIdDTO request
            ){

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = principal.getId();
        Long variantId = request.variantId;
        VariantCardDTO vCard = favoritesService.addToFavorites(variantId, userId);
        return ResponseEntity.ok(vCard);
    }

    @DeleteMapping("/{variantId}")
    public ResponseEntity<Void> removeFromFavorites(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long variantId
    ){
        Long userId = principal.getId();
        favoritesService.removeFromFavorites(variantId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<VariantCardDTO>> getFavorites(
            @AuthenticationPrincipal CustomUserDetails principal
    ){
        Long userId = principal.getId();
        List<VariantCardDTO> list = favoritesService.getFavorites(userId);
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearFavorites(
            @AuthenticationPrincipal CustomUserDetails principal
    ){
        Long userId = principal.getId();
        favoritesService.clearFavorites(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/move-to-cart")
    public ResponseEntity<?> moveToCart(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestBody List<Long> variantIds
    ){
        Long userId = principal.getId();
        FavoritesService.MoveResult result = favoritesService.moveFavoritesToCartByUsername(userId, variantIds);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }



}
