package com.java_service.java_service.repository;

import com.java_service.java_service.model.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, String> {
}