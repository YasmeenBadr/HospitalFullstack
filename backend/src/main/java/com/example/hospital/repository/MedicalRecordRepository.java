package com.example.hospital.repository;

import com.example.hospital.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);

    List<MedicalRecord> findByPatientIdAndCategory(Long patientId, String category);
}
