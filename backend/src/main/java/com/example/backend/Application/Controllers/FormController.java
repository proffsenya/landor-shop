package com.example.backend.Application.Controllers;

import com.example.backend.Domain.DTOs.FeedbackFormDTO;
import com.example.backend.Domain.DTOs.NurseryFormDTO;
import com.example.backend.Domain.Models.FeedbackForm;
import com.example.backend.Domain.Models.NurseryForm;
import com.example.backend.Infrastructure.Repos.FeedbackFormRepository;
import com.example.backend.Infrastructure.Repos.NurseryFormRepository;
import com.example.backend.Infrastructure.Services.EmailService;
import com.example.backend.Infrastructure.Services.FormService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forms")
class FormController {
    private final FeedbackFormRepository feedbackFormRepository;
    private final NurseryFormRepository nurseryFormRepository;
    private final FormService formService;
    private final EmailService emailService;
    
    public FormController(FeedbackFormRepository feedbackFormRepository,  NurseryFormRepository nurseryFormRepository, 
                         FormService formService, EmailService emailService) {
        this.feedbackFormRepository = feedbackFormRepository;
        this.nurseryFormRepository = nurseryFormRepository;
        this.formService = formService;
        this.emailService = emailService;
    }

    @PostMapping("/feedbackform")
    public ResponseEntity<FeedbackForm> createFeedbackForm(@RequestBody FeedbackFormDTO formDTO) {
        FeedbackForm savedForm = formService.saveFeedbackForm(formDTO);
        
        // Отправляем email уведомление
        emailService.sendCooperationFormEmail(
            formDTO.name(),
            formDTO.phone(),
            formDTO.email(),
            formDTO.city(),
            formDTO.comment()
        );
        
        return ResponseEntity.ok(savedForm);
    }

    @PostMapping(value ="/nurseryform", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NurseryForm> createNurseryForm(
            @RequestPart("nurseryFormDTO") @Valid NurseryFormDTO dto,
            @RequestPart(value = "registrationFile", required = false) MultipartFile registrationFile
    ) {
        NurseryForm savedForm = formService.saveNurseryForm(dto, registrationFile);
        
        // Отправляем email уведомление
        emailService.sendBreedersFormEmail(
            dto.organizationName(),
            dto.fullName(),
            dto.city(),
            dto.email(),
            dto.phone(),
            dto.fileName()
        );
        
        return ResponseEntity.ok(savedForm);
    }

    @GetMapping("/feedbackform")
    public ResponseEntity<List<FeedbackForm>> getAllFeedbackForms() {
        return ResponseEntity.ok(feedbackFormRepository.findAll());
    }

    @GetMapping("/nurseryform")
    public ResponseEntity<List<NurseryForm>> getAllNurseryForms() {
        return ResponseEntity.ok(nurseryFormRepository.findAll());
    }

    @GetMapping("/nurseryform/{id}")
    public ResponseEntity<Map<String, Object>> getNurseryFormWithFileUrl(@PathVariable Integer id) {
        NurseryForm form = formService.getNurseryFormById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("id", form.getId());
        response.put("organizationName", form.getOrganizationName());
        response.put("fullName", form.getFullName());
        response.put("city", form.getCity());
        response.put("email", form.getEmail());
        response.put("phone", form.getPhone());
        response.put("createdAt", form.getCreatedAt());
        response.put("fileName", form.getFileName());

        if (form.getRegistrationFile() != null && form.getRegistrationFile().length > 0) {
            response.put("fileUrl", "/api/forms/nurseryform/" + form.getId() + "/file");
            response.put("hasFile", true);
        } else {
            response.put("hasFile", false);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/nurseryform/{id}/file")
    public ResponseEntity<byte[]> downloadNurseryFormFile(@PathVariable Integer id) {
        NurseryForm form = formService.getNurseryFormById(id);

        if (form.getRegistrationFile() == null || form.getRegistrationFile().length == 0) {
            return ResponseEntity.notFound().build();
        }

        String contentType = form.getFileContentType();
        if (contentType == null || contentType.isEmpty()) {
            if (form.getFileName() != null) {
                if (form.getFileName().toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                } else if (form.getFileName().toLowerCase().endsWith(".jpg") ||
                        form.getFileName().toLowerCase().endsWith(".jpeg")) {
                    contentType = "image/jpeg";
                } else if (form.getFileName().toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                }
            }
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));

        if (!contentType.startsWith("image/")) {
            headers.setContentDispositionFormData("attachment", form.getFileName());
        } else {
            headers.setContentDispositionFormData("inline", form.getFileName());
        }

        return new ResponseEntity<>(form.getRegistrationFile(), headers, HttpStatus.OK);
    }
}
