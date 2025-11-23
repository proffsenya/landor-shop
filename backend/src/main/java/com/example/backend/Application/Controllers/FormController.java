package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.CreateProductDTO;
import com.example.backend.Domain.DTOs.FeedbackFormDTO;
import com.example.backend.Domain.DTOs.NurseryFormDTO;
import com.example.backend.Domain.Models.FeedbackForm;
import com.example.backend.Domain.Models.NurseryForm;
import com.example.backend.Infrastructure.Repos.FeedbackFormRepository;
import com.example.backend.Infrastructure.Repos.NurseryFormRepository;
import com.example.backend.Infrastructure.Services.FormService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/forms")
class FormController {
    private final FeedbackFormRepository feedbackFormRepository;
    private final NurseryFormRepository nurseryFormRepository;
    private final FormService formService;
    public FormController(FeedbackFormRepository feedbackFormRepository,  NurseryFormRepository nurseryFormRepository, FormService formService) {
        this.feedbackFormRepository = feedbackFormRepository;
        this.nurseryFormRepository = nurseryFormRepository;
        this.formService = formService;
    }

    @PostMapping("/feedbackform")
    public ResponseEntity<FeedbackForm> createFeedbackForm(@RequestBody FeedbackFormDTO formDTO) {
        return ResponseEntity.ok(formService.saveFeedbackForm(formDTO));
    }

    @PostMapping(value ="/nurseryform", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NurseryForm> createNurseryForm(
            @RequestPart("nurseryFormDTO") @Valid NurseryFormDTO dto,
            @RequestPart(value = "registrationFile", required = false) MultipartFile registrationFile
    ) {
        return ResponseEntity.ok(formService.saveNurseryForm(dto, registrationFile));
    }

    @GetMapping("/feedbackform")
    public ResponseEntity<List<FeedbackForm>> getAllFeedbackForms() {
        return ResponseEntity.ok(feedbackFormRepository.findAll());
    }

    @GetMapping("/nurseryform")
    public ResponseEntity<List<NurseryForm>> getAllNurseryForms() {
        return ResponseEntity.ok(nurseryFormRepository.findAll());
    }
}
