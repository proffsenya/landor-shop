package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.FlavorCreateDTO;
import com.example.backend.Domain.DTOs.FlavorDTO;
import com.example.backend.Infrastructure.Services.FlavorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/flavors")
class FlavorController {
    private final FlavorService  flavorService;
    @Autowired
    public FlavorController(FlavorService flavorService) {
        this.flavorService = flavorService;
    }

    @GetMapping
    public ResponseEntity<List<FlavorDTO>> getAllFlavors()
    {
        return ResponseEntity.ok(flavorService.getAllFlavors());
    }

    @GetMapping("/{flavorId}")
    public ResponseEntity<FlavorDTO> getFlavorById(@PathVariable Long flavorId)
    {
        return ResponseEntity.ok(flavorService.getFlavorById(flavorId));
    }

    @PostMapping
    public ResponseEntity<FlavorDTO> createFlavor(@RequestBody FlavorCreateDTO dto){
        return ResponseEntity.ok(flavorService.createFlavor(dto));
    }

    @DeleteMapping("/{flavorId}")
    public ResponseEntity<?> deleteFlavorById(@PathVariable Long flavorId) {
        flavorService.deleteFlavorById(flavorId);
        return ResponseEntity.noContent().build();
    }
}
