package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.FeedbackFormDTO;
import com.example.backend.Domain.DTOs.NurseryFormDTO;
import com.example.backend.Domain.Models.FeedbackForm;
import com.example.backend.Domain.Models.NurseryForm;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Repos.FeedbackFormRepository;
import com.example.backend.Infrastructure.Repos.NurseryFormRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    public NurseryForm saveNurseryForm(NurseryFormDTO formDto, MultipartFile file){
        NurseryForm nurseryForm = new NurseryForm();
        nurseryForm.setOrganizationName(formDto.organizationName());
        nurseryForm.setCity(formDto.city());
        nurseryForm.setEmail(formDto.email());
        nurseryForm.setPhone(formDto.phone());
        nurseryForm.setFullName(formDto.fullName());

        if (file != null && !file.isEmpty()) {
            String ct = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
            boolean allowed = ct.startsWith("image/") || ct.equals("application/pdf");
            if (!allowed) {
                throw new InvalidRequestException("Unsupported file type: " + ct);
            }
            long maxBytes = 5L * 1024 * 1024;
            if (file.getSize() > maxBytes) {
                throw new InvalidRequestException("File too large");
            }

            try {
                nurseryForm.setRegistrationFile(file.getBytes());
                nurseryForm.setFileName(file.getOriginalFilename());
            } catch (IOException e) {
                throw new InvalidRequestException("File processing failed");
            }
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
