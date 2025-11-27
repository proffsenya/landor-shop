package com.example.backend.Application.Controllers.Parameters;

import com.example.backend.Domain.DTOs.CountryCreateDTO;
import com.example.backend.Domain.DTOs.CountryDTO;
import com.example.backend.Infrastructure.Services.CountryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/countries")
class CountryController {
    private final CountryService countryService;
    public CountryController(CountryService countryService) {
        this.countryService = countryService;
    }
    @PostMapping
    public ResponseEntity<CountryDTO> createCountry(@RequestBody CountryCreateDTO dto) {
        return ResponseEntity.ok(countryService.createCountry(dto));
    }

    @GetMapping("/{countryId}")
    public ResponseEntity<CountryDTO> getCountry(@PathVariable Integer countryId) {
        return ResponseEntity.ok(countryService.getCountryById(countryId));
    }

    @GetMapping
    public ResponseEntity<List<CountryDTO>> getAllCountries() {
        return ResponseEntity.ok(countryService.getAllCountries());
    }

    @DeleteMapping("/{countryId}")
    public ResponseEntity<?> deleteCountryById(@PathVariable Integer countryId) {
        countryService.deleteCountryById(countryId);
        return ResponseEntity.noContent().build();
    }
}
