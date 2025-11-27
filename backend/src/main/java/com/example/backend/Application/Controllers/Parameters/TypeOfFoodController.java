package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.TypeOfFoodDTO;
import com.example.backend.Domain.DTOs.TypeoffoodCreateDTO;
import com.example.backend.Infrastructure.Services.TypeOfFoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/typeOfFoods")
class TypeOfFoodController {
    private final TypeOfFoodService  typeOfFoodService;
    @Autowired
    public TypeOfFoodController(TypeOfFoodService typeOfFoodService) {
        this.typeOfFoodService = typeOfFoodService;
    }

    @GetMapping
    public ResponseEntity<List<TypeOfFoodDTO>> getAllTypeOfFood() {
        return ResponseEntity.ok(typeOfFoodService.getAllTypeOfFood());
    }

    @GetMapping("/{typeOfFoodId}")
    public ResponseEntity<TypeOfFoodDTO> getTypeOfFoodById(@PathVariable Integer typeOfFoodId) {
        return ResponseEntity.ok(typeOfFoodService.getTypeOfFood(typeOfFoodId));
    }

    @PostMapping
    public ResponseEntity<TypeOfFoodDTO> createTypeOfFood(@RequestBody TypeoffoodCreateDTO dto) {
        return ResponseEntity.ok(typeOfFoodService.createTypeOfFood(dto));
    }

    @DeleteMapping("/{typeOfFoodId}")
    public ResponseEntity<?> deleteTypeOfFoodById(@PathVariable Integer typeOfFoodId) {
        typeOfFoodService.deleteTypeOfFoodById(typeOfFoodId);
        return ResponseEntity.noContent().build();
    }

}
