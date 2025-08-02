package com.java_service.java_service.controller;

import com.java_service.java_service.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeText(@RequestBody AnalysisRequest request) {
        analysisService.executeAnalysis(request.getJobId());
        return ResponseEntity.ok("Analysis started for job: " + request.getJobId());
    }

    public static class AnalysisRequest {
        private String jobId;


        public String getJobId() {
            return jobId;
        }

        public void setJobId(String jobId) {
            this.jobId = jobId;
        }
    }
}