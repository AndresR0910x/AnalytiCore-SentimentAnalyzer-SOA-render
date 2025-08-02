package com.java_service.java_service;

import com.java_service.java_service.model.*;
import com.java_service.java_service.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.Transactional;

@SpringBootApplication
public class TestDbConnection implements CommandLineRunner {

    @Autowired
    private JobRepository jobRepository;

    public static void main(String[] args) {
        SpringApplication.run(TestDbConnection.class, args);
    }

    @Override
    @Transactional
    public void run(String... args) {
        try {
            // Create a test job
            Job testJob = new Job();
            testJob.setId(java.util.UUID.randomUUID().toString());
            testJob.setText("Este es un texto de prueba desde Java");
            testJob.setStatus(Job.JobStatus.PENDIENTE);
            jobRepository.save(testJob);
            System.out.println("Registro de prueba insertado con ID: " + testJob.getId());

            // Query the test job
            Job retrievedJob = jobRepository.findById(testJob.getId())
                    .orElseThrow(() -> new RuntimeException("Registro no encontrado"));
            System.out.println("Registro recuperado: ID=" + retrievedJob.getId() +
                    ", Text=" + retrievedJob.getText() +
                    ", Status=" + retrievedJob.getStatus());

            System.out.println("Conexión a la base de datos Neon exitosa.");
        } catch (Exception e) {
            System.err.println("Error al conectar con la base de datos: " + e.getMessage());
            e.printStackTrace();
        }
    }
}