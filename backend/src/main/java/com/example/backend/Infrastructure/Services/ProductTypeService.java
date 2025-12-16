package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.ProductTypeCreateDTO;
import com.example.backend.Domain.DTOs.ProductTypeDTO;
import com.example.backend.Domain.Models.ProductType;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.ProductTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductTypeService {
    private final ProductTypeRepository productTypeRepository;
    public ProductTypeService(ProductTypeRepository productTypeRepository) {
        this.productTypeRepository = productTypeRepository;
    }

    @Transactional
    public ProductTypeDTO createProductType(ProductTypeCreateDTO dto){
        if (dto == null){
            throw new InvalidRequestException("ProductTypeCreateDTO is null");
        }
        if(productTypeRepository.findByName(dto.name()).isPresent()){
            throw new InvalidRequestException("ProductTypeCreateDTO is already exists");
        };
        ProductType productType = new ProductType();
        productType.setName(dto.name());
        productType.setSlug(dto.slug());
        ProductType newtype = productTypeRepository.save(productType);

        return new ProductTypeDTO(
                newtype.getId(),
                newtype.getName(),
                newtype.getSlug()
        );
    }

    @Transactional
    public ProductTypeDTO getProductTypeById(Long id){
        if (id == null || id <= 0){
            throw new InvalidRequestException("id is null");
        }
        if (!productTypeRepository.findById(id).isPresent()){
            throw new InvalidRequestException("ProductTypeDTO is not exists");
        }
        ProductType productType = productTypeRepository.findById(id).get();
        return new ProductTypeDTO(
                productType.getId(),
                productType.getName(),
                productType.getSlug()
        );
    }
    @Transactional
    public List<ProductTypeDTO> getAllProductTypes(){
        List<ProductType> productTypes = productTypeRepository.findAll();
        List<ProductTypeDTO> productTypeDTOS = new ArrayList<>();
        for (ProductType productType : productTypes) {
            productTypeDTOS.add(new ProductTypeDTO(productType.getId(), productType.getName(), productType.getSlug()));
        }
        return productTypeDTOS;
    }

    @Transactional
    public void deleteProductTypeById(Long id) {
        if (productTypeRepository.existsById(id)) {
            productTypeRepository.deleteById(id);
        }
    }

}
