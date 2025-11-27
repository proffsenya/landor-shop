package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.ScentCreateDTO;
import com.example.backend.Domain.DTOs.ScentDTO;
import com.example.backend.Domain.Models.Scent;
import com.example.backend.Infrastructure.Repos.ScentRepository;
import com.example.backend.Infrastructure.Services.ScentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scents")
class ScentController {
    private ScentService scentService;
    @Autowired
    public ScentController(ScentService scentService) {
        this.scentService = scentService;
    }

    @PostMapping
    public ResponseEntity<ScentDTO> createScent(@RequestBody ScentCreateDTO dto) {
        return ResponseEntity.ok(scentService.createScent(dto));
    }

    @GetMapping("/{scentId}")
    public ResponseEntity<ScentDTO> getScent(@PathVariable("scentId") Long scentId) {
        return ResponseEntity.ok(scentService.getScentById(scentId));
    }

    @GetMapping
    public ResponseEntity<List<ScentDTO>> getAllScents() {
        return ResponseEntity.ok(scentService.getAllScents());
    }

    @DeleteMapping("/{scentId}")
    public ResponseEntity<?> deleteScentById(@PathVariable Long scentId) {
        scentService.deleteScentById(scentId);
        return ResponseEntity.noContent().build();
    }
}
