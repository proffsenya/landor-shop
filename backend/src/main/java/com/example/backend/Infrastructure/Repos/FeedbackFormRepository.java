package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.FeedbackForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface FeedbackFormRepository extends JpaRepository<FeedbackForm, Integer> {
    List<FeedbackForm> findByFormId(Integer formId);
}