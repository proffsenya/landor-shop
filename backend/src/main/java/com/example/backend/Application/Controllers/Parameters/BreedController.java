package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.BreedCreateDTO;
import com.example.backend.Domain.DTOs.BreedDTO;
import com.example.backend.Domain.Models.Breed;
import com.example.backend.Infrastructure.Repos.BreedRepository;
import com.example.backend.Infrastructure.Services.BreedsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/breeds")
class BreedController {
    private final BreedsService breedsService;
    public BreedController(BreedsService breedsService) {
        this.breedsService = breedsService;
    }

    @PostMapping
    public ResponseEntity<BreedDTO> addBreed(@RequestBody BreedCreateDTO dto) {
        return ResponseEntity.ok(breedsService.createBreed(dto));
    }

    @GetMapping("/{breedId}")
    public ResponseEntity<BreedDTO> getBreedById(@PathVariable int breedId) {
        return ResponseEntity.ok(breedsService.getBreed(breedId));
    }

    @GetMapping
    public ResponseEntity<List<BreedDTO>> getAllBreeds() {
        return ResponseEntity.ok(breedsService.getAllBreeds());
    }

    @DeleteMapping("/{breedId}")
    public ResponseEntity<?> deleteBreedById(@PathVariable int breedId) {
        breedsService.deleteBreedById(breedId);
        return ResponseEntity.noContent().build();
    }

}
