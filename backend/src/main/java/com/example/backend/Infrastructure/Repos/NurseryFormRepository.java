package com.example.backend.Infrastructure.Repos;

import com.example.backend.Domain.Models.NurseryForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface NurseryFormRepository extends JpaRepository<NurseryForm, Integer> {
    List<NurseryForm> findByFormId(Integer formId);
    List<NurseryForm> findAll();
}