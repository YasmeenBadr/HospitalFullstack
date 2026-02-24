package com.example.hospital.controller;

import com.example.hospital.model.Prescription;
import com.example.hospital.repository.PrescriptionRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class PrescriptionController {

    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionController(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    @GetMapping
    public List<Prescription> getAll() {
        return prescriptionRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getById(@PathVariable Long id) {
        return prescriptionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-patient/{patientId}")
    public List<Prescription> getByPatient(@PathVariable Long patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    @PostMapping
    public Prescription create(@Valid @RequestBody Prescription prescription) {
        prescription.setId(null);
        return prescriptionRepository.save(prescription);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prescription> update(@PathVariable Long id, @Valid @RequestBody Prescription updated) {
        return prescriptionRepository.findById(id)
                .map(existing -> {
                    existing.setPatient(updated.getPatient());
                    existing.setDoctor(updated.getDoctor());
                    existing.setMedicationName(updated.getMedicationName());
                    existing.setDosage(updated.getDosage());
                    existing.setInstructions(updated.getInstructions());
                    existing.setPrescribedDate(updated.getPrescribedDate());
                    existing.setStatus(updated.getStatus());
                    return ResponseEntity.ok(prescriptionRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!prescriptionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        prescriptionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
