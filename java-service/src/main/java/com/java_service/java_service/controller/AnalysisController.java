package com.java_service.java_service.controller;

import com.java_service.java_service.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
    origins = {
        "http://localhost:5173", 
        "http://localhost:3000",
        "https://react-frontend-latest-70au.onrender.com"
    },
    allowCredentials = "true",
    maxAge = 86400,
    allowedHeaders = {
        "Content-Type", 
        "Authorization", 
        "Accept", 
        "Origin", 
        "X-Requested-With",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    },
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeText(@RequestBody AnalysisRequest request) {
        try {
            analysisService.executeAnalysis(request.getJobId());
            return ResponseEntity.ok("Analysis started for job: " + request.getJobId());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error starting analysis: " + e.getMessage());
        }
    }

    // Endpoint de health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("{\"status\": \"healthy\", \"service\": \"analysis-service\"}");
    }

    // Manejo explícito de OPTIONS para CORS preflight
    @RequestMapping(value = "/analyze", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
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

