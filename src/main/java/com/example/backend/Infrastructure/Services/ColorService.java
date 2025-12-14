package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.ColorCreateDTO;
import com.example.backend.Domain.DTOs.ColorDTO;
import com.example.backend.Domain.Models.Color;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.ColorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.ArrayList;
import java.util.List;

@Service
public class ColorService {
    private ColorRepository colorRepository;
    public ColorService(ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    @Transactional
    public ColorDTO createColor(ColorCreateDTO dto){
        if (dto == null){
            throw new InvalidRequestException("dto is null");
        }
        if (colorRepository.findByName(dto.name()).isPresent()){
            throw new InvalidRequestException("color already exists");
        }
        Color color = new Color();
        color.setName(dto.name());
        color.setSlug(dto.slug());
        Color newcolor = colorRepository.save(color);

        return new ColorDTO(
                newcolor.getId(),
                newcolor.getName(),
                newcolor.getSlug()
        );
    }

    @Transactional
    public ColorDTO getColorById(Long id){
        if (id == null || id <= 0){
            throw new InvalidRequestException("id is not correct");
        }

        if (!colorRepository.findById(id).isPresent()){
            throw new InvalidRequestException("color does not exists");
        }
        Color color = colorRepository.findById(id).get();
        return new ColorDTO(
                color.getId(),
                color.getName(),
                color.getSlug()
        );
    }

    @Transactional
    public List<ColorDTO> getAllColors(){
        List<Color> colors = colorRepository.findAll();
        List<ColorDTO> colorDTOS = new ArrayList<>();
        for (Color color : colors){
            colorDTOS.add(new ColorDTO(color.getId(), color.getName(), color.getSlug()));
        }

        return colorDTOS;
    }

    @Transactional
    public void deleteColorById(Long id) {
        if (colorRepository.existsById(id)) {
            colorRepository.deleteById(id);
        }
    }

}
