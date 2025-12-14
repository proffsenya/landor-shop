package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.TypeOfFoodDTO;
import com.example.backend.Domain.DTOs.TypeoffoodCreateDTO;
import com.example.backend.Domain.Models.Typeoffood;
import com.example.backend.Infrastructure.Repos.TypeoffoodRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;

@Service
public class TypeOfFoodService {
    private final TypeoffoodRepository  typeoffoodRepository;
    public TypeOfFoodService(TypeoffoodRepository typeoffoodRepository) {
        this.typeoffoodRepository = typeoffoodRepository;
    }

    @Transactional
    public TypeOfFoodDTO getTypeOfFood(Integer id) {
        if (id == null || id <= 0) {
            throw new InvalidParameterException("id is null or empty");
        }
        if(!typeoffoodRepository.findById(id).isPresent()) {
            throw new InvalidParameterException("this type is not found");
        }
        Typeoffood type = typeoffoodRepository.findById(id).get();
        return new TypeOfFoodDTO(type.getId(), type.getName(), type.getSlug());
    }

    @Transactional
    public TypeOfFoodDTO createTypeOfFood(TypeoffoodCreateDTO dto) {
        if (dto == null) {
            throw new InvalidParameterException("dto is null");
        }
        if (typeoffoodRepository.findByName(dto.name()).isPresent()) {
            throw new InvalidParameterException("this type already exists");
        }
        Typeoffood type = new Typeoffood();
        type.setName(dto.name());
        type.setSlug(dto.slug());
        Typeoffood newtype = typeoffoodRepository.save(type);

        return new TypeOfFoodDTO(newtype.getId(), newtype.getName(), newtype.getSlug());
    }

    @Transactional
    public List<TypeOfFoodDTO> getAllTypeOfFood() {
        List<Typeoffood> all = typeoffoodRepository.findAll();
        List<TypeOfFoodDTO> dtos = new ArrayList<TypeOfFoodDTO>();
        for (Typeoffood type: all) {
            dtos.add(new TypeOfFoodDTO(type.getId(), type.getName(), type.getSlug()));
        }
        return dtos;
    }

    @Transactional
    public void deleteTypeOfFoodById(Integer id) {
        if (typeoffoodRepository.existsById(id)) {
            typeoffoodRepository.deleteById(id);
        }
    }
}
