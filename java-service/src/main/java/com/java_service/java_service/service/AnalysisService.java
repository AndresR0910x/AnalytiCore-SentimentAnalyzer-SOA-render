package com.java_service.java_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.java_service.java_service.repository.*;
import com.java_service.java_service.service.command.AnalyzeCommand;

import jakarta.transaction.Transactional;

@Service
public class AnalysisService {
    @Autowired
    private JobRepository jobRepository;

    @Transactional
    public void executeAnalysis(String jobId){
        AnalyzeCommand command = new AnalyzeCommand(jobId, jobRepository);
        command.execute();
    }
}
