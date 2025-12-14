package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.ScentCreateDTO;
import com.example.backend.Domain.DTOs.ScentDTO;
import com.example.backend.Domain.Models.Scent;
import com.example.backend.Infrastructure.Repos.ScentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ScentService {
    private final ScentRepository scentRepository;
    public ScentService(ScentRepository scentRepository) {
        this.scentRepository = scentRepository;
    }

    @Transactional
    public ScentDTO createScent(ScentCreateDTO dto) {
        if (dto == null){
            throw new InvalidParameterException("ScentCreateDTO is null");
        }
        if (scentRepository.findByName(dto.name()).isPresent()){
            throw new InvalidParameterException("ScentCreateDTO name is exist");
        }
        Scent scent = new Scent();
        scent.setName(dto.name());
        scent.setSlug(dto.slug());
        Scent newscent = scentRepository.save(scent);
        return new ScentDTO(newscent.getId(), newscent.getName(), newscent.getSlug());
    }

    @Transactional
    public ScentDTO getScentById(Long id) {
        if (id == null || id <= 0){
            throw new InvalidParameterException("id is null");
        }
        if (!scentRepository.findById(id).isPresent()){
            throw new InvalidParameterException("Scent is not found");
        }
        Scent scent = scentRepository.findById(id).get();
        return new ScentDTO(scent.getId(), scent.getName(), scent.getSlug());
    }

    @Transactional
    public List<ScentDTO> getAllScents(){
        List<Scent> scents = scentRepository.findAll();
        List<ScentDTO> scentDTOs = new ArrayList<>();
        for (Scent scent : scents){
            scentDTOs.add(new ScentDTO(scent.getId(), scent.getName(), scent.getSlug()));
        }
        return scentDTOs;
    }

    @Transactional
    public void deleteScentById(Long id) {
        if (scentRepository.existsById(id)) {
            scentRepository.deleteById(id);
        }
    }

}
