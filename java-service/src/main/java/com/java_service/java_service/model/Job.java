package com.java_service.java_service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "jobs")
public class Job {

    public enum JobStatus {
        PENDIENTE, PROCESANDO, COMPLETADO
    }

    @Id
    private String id;

    @Column(nullable = false)
    private String text;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    private String sentiment;

    private String keywords;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getSentiment() {
        return sentiment;
    }

    public void setSentiment(String sentiment) {
        this.sentiment = sentiment;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }
}