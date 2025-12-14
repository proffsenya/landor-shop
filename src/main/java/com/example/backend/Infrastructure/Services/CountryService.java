package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.CountryCreateDTO;
import com.example.backend.Domain.DTOs.CountryDTO;
import com.example.backend.Domain.Models.Country;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.CountryRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CountryService {
    private final CountryRepository countryRepository;
    public CountryService(CountryRepository countryRepository) {
        this.countryRepository = countryRepository;
    }

    @Transactional
    public CountryDTO createCountry(@NotNull CountryCreateDTO dto) {
        if (dto == null){
            throw new InvalidRequestException("CountryCreateDTO is null");
        }
        if(countryRepository.findByName(dto.name()).isPresent()){
            throw new InvalidRequestException("Country already exists");
        }
        Country country = new Country();
        country.setName(dto.name());
        country.setSlug(dto.slug());
        countryRepository.save(country);

        return new CountryDTO(country.getId(), country.getName(), country.getSlug());
    }

    @Transactional
    public CountryDTO getCountryById(@NotNull Integer id) {
        if (id == null || id <= 0){
            throw new InvalidRequestException("CountryId is null");
        }
        if (!countryRepository.findById(id).isPresent()){
            throw new InvalidRequestException("Country does not exist");
        }
        Country country = countryRepository.findById(id).get();
        return new CountryDTO(country.getId(), country.getName(), country.getSlug());
    }

    @Transactional
    public List<CountryDTO> getAllCountries() {
        List<Country> countries = countryRepository.findAll();
        List<CountryDTO> dtos = new ArrayList<>();
        for (Country country : countries) {
            dtos.add(new CountryDTO(country.getId(), country.getName(), country.getSlug()));
        }

        return dtos;
    }

    @Transactional
    public void deleteCountryById(Integer id) {
        if (countryRepository.existsById(id)) {
            countryRepository.deleteById(id);
        }
    }
}
