package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.Country;
import com.example.backend.Domain.Models.Product;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.CountryRepository;
import com.example.backend.Infrastructure.Repos.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
class CountriesService {
    private final CountryRepository countryRepository;
    private final ProductRepository productRepository;
    public CountriesService(CountryRepository countryRepository, ProductRepository productRepository) {
        this.countryRepository = countryRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public void addCountries(Long productId, List<Integer> countriesIds)
    {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidRequestException("Product not found"));

        Set<Country> countries = new LinkedHashSet<>(countryRepository.findAllById(countriesIds));
        product.getCountries().addAll(countries);
        productRepository.save(product);
    }

    @Transactional
    public void removeCountries(Long productId, List<Integer> countriesIds)
    {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new InvalidRequestException("Product not found"));

        product.getCountries().removeIf(country -> countriesIds.contains(country.getId()));
        productRepository.save(product);
    }
}
