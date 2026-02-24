package com.example.hospital.controller;

import com.example.hospital.model.MedicalRecord;
import com.example.hospital.repository.MedicalRecordRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;

    public MedicalRecordController(MedicalRecordRepository medicalRecordRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @GetMapping
    public List<MedicalRecord> getAll() {
        return medicalRecordRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getById(@PathVariable Long id) {
        return medicalRecordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-patient/{patientId}")
    public List<MedicalRecord> getByPatient(@PathVariable Long patientId) {
        return medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
    }

    @PostMapping
    public MedicalRecord create(@Valid @RequestBody MedicalRecord record) {
        record.setId(null);
        return medicalRecordRepository.save(record);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecord> update(@PathVariable Long id, @Valid @RequestBody MedicalRecord updated) {
        return medicalRecordRepository.findById(id)
                .map(existing -> {
                    existing.setPatient(updated.getPatient());
                    existing.setRecordDate(updated.getRecordDate());
                    existing.setCategory(updated.getCategory());
                    existing.setTitle(updated.getTitle());
                    existing.setContent(updated.getContent());
                    return ResponseEntity.ok(medicalRecordRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!medicalRecordRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        medicalRecordRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
