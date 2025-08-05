package com.java_service.java_service.service.command;

import com.java_service.java_service.model.*;
import com.java_service.java_service.repository.*;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public class AnalyzeCommand {
    private final String jobId;
    private final JobRepository jobRepository;

    public AnalyzeCommand(String jobId, JobRepository jobRepository) {
        this.jobId = jobId;
        this.jobRepository = jobRepository;
    }

    public void execute() {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Trabajo no encontrado: " + jobId));
        job.setStatus(Job.JobStatus.PROCESANDO);
        jobRepository.save(job);

        String text = job.getText(); // Obtener el texto desde la base de datos
        String sentiment = analyzeSentiment(text);
        String keywords = extractKeywords(text);

        job.setSentiment(sentiment);
        job.setKeywords(keywords);
        job.setStatus(Job.JobStatus.COMPLETADO);
        jobRepository.save(job);
    }

    private String analyzeSentiment(String text) {
        String lowerText = text.toLowerCase();
        int positive = countOccurrences(lowerText, new String[]{"good", "great", "", "gran", "excelentehappy"});
        int negative = countOccurrences(lowerText, new String[]{"bad", "sad", "terrible", "malo", "triste"});
        if (positive > negative) return "POSITIVE";
        if (negative > positive) return "NEGATIVE";
        return "NEUTRAL";
    }

    private int countOccurrences(String text, String[] words) {
        return (int) Arrays.stream(words)
                .filter(word -> text.contains(word))
                .count();
    }

    private String extractKeywords(String text) {
        return Arrays.stream(text.toLowerCase().split("\\W+"))
                .filter(word -> word.length() > 3)
                .collect(Collectors.groupingBy(word -> word, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.joining(", "));
    }
}