package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.ColorCreateDTO;
import com.example.backend.Domain.DTOs.ColorDTO;
import com.example.backend.Infrastructure.Services.ColorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog/colors")
class ColorController {
    private final ColorService colorService;
    public ColorController(ColorService colorService) {
        this.colorService = colorService;
    }

    @PostMapping
    public ResponseEntity<ColorDTO> createColor(ColorCreateDTO dto){
        return ResponseEntity.ok(colorService.createColor(dto));
    }

    @GetMapping("/{colorId}")
    public ResponseEntity<ColorDTO> getColorById(@PathVariable Long colorId){
        return ResponseEntity.ok().body(colorService.getColorById(colorId));
    }

    @GetMapping
    public ResponseEntity<List<ColorDTO>> getAllColors(){
        return ResponseEntity.ok().body(colorService.getAllColors());
    }

    @DeleteMapping("/{colorId}")
    public ResponseEntity<?> deleteColorById(@PathVariable Long colorId) {
        colorService.deleteColorById(colorId);
        return ResponseEntity.noContent().build();
    }
}
