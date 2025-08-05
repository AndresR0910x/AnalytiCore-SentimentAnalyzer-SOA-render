package com.java_service.java_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.java_service.java_service.repository.JobRepository;
import com.java_service.java_service.service.command.AnalyzeCommand;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AnalysisService {
    private static final Logger logger = LoggerFactory.getLogger(AnalysisService.class);

    @Autowired
    private JobRepository jobRepository;

    @Transactional
    public void executeAnalysis(String jobId) {
        if (jobId == null || jobId.trim().isEmpty()) {
            throw new IllegalArgumentException("JobId no puede ser nulo o vacío");
        }

        try {
            logger.info("Iniciando análisis para jobId: {}", jobId);
            AnalyzeCommand command = new AnalyzeCommand(jobId, jobRepository);
            command.execute();
            logger.info("Análisis completado para jobId: {}", jobId);
        } catch (Exception e) {
            logger.error("Error en el análisis para jobId {}: {}", jobId, e.getMessage(), e);
            throw new RuntimeException("Fallo al ejecutar el análisis: " + e.getMessage(), e);
        }
    }
}