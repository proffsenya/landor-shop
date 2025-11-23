package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.FeedbackFormDTO;
import com.example.backend.Domain.DTOs.NurseryFormDTO;
import com.example.backend.Domain.Models.FeedbackForm;
import com.example.backend.Domain.Models.NurseryForm;
import com.example.backend.Infrastructure.Repos.FeedbackFormRepository;
import com.example.backend.Infrastructure.Repos.NurseryFormRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FormService {
    private final NurseryFormRepository nurseryFormRepository;
    private final FeedbackFormRepository feedbackFormRepository;
    public FormService(NurseryFormRepository nurseryFormRepository, FeedbackFormRepository feedbackFormRepository){
        this.nurseryFormRepository = nurseryFormRepository;
        this.feedbackFormRepository = feedbackFormRepository;
    }

    @Transactional
    public NurseryForm saveNurseryForm(NurseryFormDTO formDto){
        NurseryForm nurseryForm = new NurseryForm();
        nurseryForm.setOrganizationName(formDto.organizationName());
        nurseryForm.setCity(formDto.city());
        nurseryForm.setEmail(formDto.email());
        nurseryForm.setPhone(formDto.phone());
        nurseryForm.setFullName(formDto.fullName());

        if (formDto.registrationFile() != null){
            nurseryForm.setFileName(formDto.fileName());
            nurseryForm.setRegistrationFile(formDto.registrationFile());

        }
        return nurseryFormRepository.save(nurseryForm);
    }

    @Transactional
    public FeedbackForm saveFeedbackForm(FeedbackFormDTO dto) {
        FeedbackForm form = new FeedbackForm();
        form.setName(dto.name());
        form.setPhone(dto.phone());
        form.setEmail(dto.email());
        form.setCity(dto.city());
        form.setComment(dto.comment());
        return feedbackFormRepository.save(form);
    }

    @Transactional
    public List<NurseryForm> findAllNurseryForms(){
        List<NurseryForm> nurseryForms = nurseryFormRepository.findAll();
        return nurseryForms;
    }

    @Transactional
    public List<FeedbackForm> findAllFeedbackForms(){
        List<FeedbackForm> feedbackForms = feedbackFormRepository.findAll();
        return feedbackForms;
    }
}
