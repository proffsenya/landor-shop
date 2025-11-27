package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.FlavorCreateDTO;
import com.example.backend.Domain.DTOs.FlavorDTO;
import com.example.backend.Domain.Models.Flavor;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.FlavorRepository;
import jakarta.validation.constraints.Size;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class FlavorService {
    private final FlavorRepository flavorRepository;
    public FlavorService(FlavorRepository flavorRepository) {
        this.flavorRepository = flavorRepository;
    }

    @Transactional
    public FlavorDTO createFlavor(FlavorCreateDTO dto){
        if (dto == null){
            throw new InvalidRequestException("FlavorCreateDTO is null");
        }
        if (flavorRepository.findByName(dto.name()).isPresent()){
            throw new InvalidRequestException("FlavorName is already exists");
        }
        Flavor flavor = new Flavor();
        flavor.setName(dto.name());
        flavor.setCanonicalName(dto.canonicalName());
        Flavor newflavor = flavorRepository.save(flavor);

        return new FlavorDTO(
                newflavor.getId(),
                newflavor.getName(),
                newflavor.getCanonicalName()
        );
    }

    @Transactional
    public FlavorDTO getFlavorById(Long id){
        if (id == null || id <= 0){
            throw new InvalidRequestException("FlavorId is null");
        }
        if (!flavorRepository.findById(id).isPresent()){
            throw new InvalidRequestException("FlavorId is not found");
        }
        Flavor flavor = flavorRepository.findById(id).get();
        return new FlavorDTO(
                flavor.getId(),
                flavor.getName(),
                flavor.getCanonicalName()
        );
    }

    @Transactional
    public List<FlavorDTO> getAllFlavors(){
        List<Flavor> flavors = flavorRepository.findAll();
        List<FlavorDTO> dtos = new ArrayList<>();
        for (Flavor flavor : flavors){
            dtos.add(new FlavorDTO(flavor.getId(), flavor.getName(), flavor.getCanonicalName()));
        }
        return dtos;
    }

    @Transactional
    public void deleteFlavorById(Long id) {
        if (flavorRepository.existsById(id)) {
            flavorRepository.deleteById(id);
        }
    }

}
