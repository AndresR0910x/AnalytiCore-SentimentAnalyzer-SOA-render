package com.java_service.java_service.controller;

import com.java_service.java_service.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "https://react-frontend-latest-70au.onrender.com"},
    allowCredentials = "true",
    maxAge = 86400,
    allowedHeaders = {"Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "Access-Control-Request-Method", "Access-Control-Request-Headers"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeText(@RequestBody AnalysisRequest request) {
        try {
            String jobId = request.getJobId();
            if (jobId == null || jobId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("JobId no puede ser nulo o vacío");
            }
            analysisService.executeAnalysis(jobId);
            return ResponseEntity.ok("Analysis started for job: " + jobId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error de validación: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error interno del servidor: " + e.getMessage());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("{\"status\": \"healthy\", \"service\": \"analysis-service\"}");
    }

    @RequestMapping(value = "/analyze", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "http://localhost:5173")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
                .header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With")
                .build();
    }

    public static class AnalysisRequest {
        private String jobId;

        public String getJobId() {
            return jobId != null ? jobId.trim() : null;
        }

        public void setJobId(String jobId) {
            this.jobId = jobId;
        }
    }
}