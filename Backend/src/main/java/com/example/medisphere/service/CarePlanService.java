package com.example.medisphere.service;

import com.example.medisphere.model.AiRiskHistory;
import com.example.medisphere.model.CarePlan;
import com.example.medisphere.model.Doctor;
import com.example.medisphere.model.Patient;
import com.example.medisphere.repository.AiRiskHistoryRepository;
import com.example.medisphere.repository.CarePlanRepository;
import com.example.medisphere.repository.DoctorRepository;
import com.example.medisphere.repository.PatientRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class CarePlanService {

    private final CarePlanRepository carePlanRepository;
    private final PatientRepository patientRepository;
    private final AiRiskHistoryRepository riskHistoryRepository;
    private final DoctorRepository doctorRepository;

    public CarePlanService(
            CarePlanRepository carePlanRepository,
            PatientRepository patientRepository,
            AiRiskHistoryRepository riskHistoryRepository,
            DoctorRepository doctorRepository) {

        this.carePlanRepository = carePlanRepository;
        this.patientRepository = patientRepository;
        this.riskHistoryRepository = riskHistoryRepository;
        this.doctorRepository = doctorRepository;
    }

    // Generate a personalized care-plan draft
    public CarePlan generate(String patientId) {

        if (patientId == null || patientId.isBlank()) {
            throw new IllegalArgumentException("Patient ID is required.");
        }

        Patient patient = patientRepository.findById(patientId.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException("Patient was not found."));

        List<AiRiskHistory> cvd =
                riskHistoryRepository
                        .findTop2ByPatientIdAndModelTypeOrderByPredictionDateDesc(
                                patientId.trim(), "CARDIOVASCULAR");

        List<AiRiskHistory> diabetes =
                riskHistoryRepository
                        .findTop2ByPatientIdAndModelTypeOrderByPredictionDateDesc(
                                patientId.trim(), "DIABETES");

        CarePlan plan = new CarePlan();

        plan.setPatientId(patient.getId());
        plan.setPatientName(patient.getName());
        plan.setCreatedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());

        List<CarePlan.RiskReference> refs = new ArrayList<>();

        cvd.stream()
                .findFirst()
                .ifPresent(r -> refs.add(toReference(r)));

        diabetes.stream()
                .findFirst()
                .ifPresent(r -> refs.add(toReference(r)));

        plan.setRiskReferences(refs);
        plan.setItems(buildGuidelineItems(cvd, diabetes));

        return carePlanRepository.save(plan);
    }

    private CarePlan.RiskReference toReference(AiRiskHistory r) {

        return new CarePlan.RiskReference(
                r.getModelType(),
                r.getRiskBand(),
                r.getRiskProbability(),
                r.getPredictionDate()
        );
    }

    /*
     * Prototype guideline mapping.
     * These recommendations are educational and monitoring prompts.
     * They are not diagnoses, prescriptions, or autonomous treatment decisions.
     */
    private List<CarePlan.CarePlanItem> buildGuidelineItems(
            List<AiRiskHistory> cvd,
            List<AiRiskHistory> diabetes) {

        List<CarePlan.CarePlanItem> items = new ArrayList<>();

        items.add(new CarePlan.CarePlanItem(
                "PROVIDER_REVIEW",
                "Review and personalize this draft",
                "Review the patient's history, current medications, " +
                        "contraindications, preferences, and applicable " +
                        "local clinical guidelines before approving.",
                "Before plan activation"
        ));

        if (!cvd.isEmpty()) {

            String band = normalize(cvd.get(0).getRiskBand());

            items.add(new CarePlan.CarePlanItem(
                    "CARDIOVASCULAR",
                    "Cardiovascular risk follow-up",
                    "Discuss the cardiovascular risk result with the care " +
                            "team and confirm an appropriate follow-up schedule. " +
                            "Risk band: " +
                            safeBand(cvd.get(0).getRiskBand()) + ".",
                    band.contains("HIGH")
                            ? "Provider-defined; prioritize timely review"
                            : "At the next scheduled review"
            ));

            items.add(new CarePlan.CarePlanItem(
                    "LIFESTYLE",
                    "Heart-health lifestyle discussion",
                    "Discuss feasible nutrition, physical activity, " +
                            "tobacco avoidance, and sleep goals tailored " +
                            "to the patient's condition and abilities.",
                    "Agree on goals with the provider"
            ));

            items.add(new CarePlan.CarePlanItem(
                    "MONITORING",
                    "Record blood pressure as advised",
                    "If home blood-pressure monitoring is appropriate, " +
                            "record readings and bring the log to the next " +
                            "clinical review.",
                    "Frequency set by provider"
            ));
        }

        if (!diabetes.isEmpty()) {

            String band = normalize(diabetes.get(0).getRiskBand());

            items.add(new CarePlan.CarePlanItem(
                    "DIABETES",
                    "Diabetes risk follow-up",
                    "Review the diabetes risk result with the care team " +
                            "and discuss whether confirmatory assessment " +
                            "or additional monitoring is needed. Risk band: " +
                            safeBand(diabetes.get(0).getRiskBand()) + ".",
                    band.contains("HIGH")
                            ? "Provider-defined; prioritize timely review"
                            : "At the next scheduled review"
            ));

            items.add(new CarePlan.CarePlanItem(
                    "LIFESTYLE",
                    "Nutrition and activity goal setting",
                    "Agree with the provider on realistic nutrition and " +
                            "activity goals based on the patient's clinical " +
                            "status and preferences.",
                    "Review progress at follow-up"
            ));
        }

        if (cvd.isEmpty() && diabetes.isEmpty()) {

            items.add(new CarePlan.CarePlanItem(
                    "ASSESSMENT",
                    "Complete risk assessment",
                    "No saved cardiovascular or diabetes prediction " +
                            "was found. Complete the relevant assessment " +
                            "before generating a risk-informed plan.",
                    "Before plan approval"
            ));
        }

        return items;
    }

    private String normalize(String value) {
        return value == null
                ? ""
                : value.toUpperCase(Locale.ROOT);
    }

    private String safeBand(String value) {
        return value == null || value.isBlank()
                ? "Not recorded"
                : value;
    }

    // Retrieve all care plans belonging to a patient
    public List<CarePlan> getByPatient(String patientId) {

        if (patientId == null || patientId.isBlank()) {
            throw new IllegalArgumentException("Patient ID is required.");
        }

        String id = patientId.trim();

        if (!patientRepository.existsById(id)) {
            throw new IllegalArgumentException("Patient was not found.");
        }

        return carePlanRepository
                .findByPatientIdOrderByCreatedAtDesc(id);
    }

    // Retrieve a care plan by ID
    public CarePlan get(String id) {

        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Care plan ID is required.");
        }

        return carePlanRepository.findById(id.trim())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Care plan was not found."));
    }

    // Update adherence status
    public CarePlan updateAdherence(
            String planId,
            String itemId,
            String status,
            String notes) {

        CarePlan plan = get(planId);

        CarePlan.CarePlanItem item = plan.getItems()
                .stream()
                .filter(i -> itemId != null && itemId.equals(i.getId()))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Care plan item was not found."));

        String normalized = status == null
                ? ""
                : status.trim().toUpperCase(Locale.ROOT);

        if (!List.of(
                "NOT_STARTED",
                "IN_PROGRESS",
                "COMPLETED",
                "SKIPPED"
        ).contains(normalized)) {

            throw new IllegalArgumentException(
                    "Status must be NOT_STARTED, IN_PROGRESS, " +
                            "COMPLETED, or SKIPPED.");
        }

        item.setStatus(normalized);
        item.setAdherenceNotes(notes);
        item.setLastUpdatedAt(LocalDateTime.now());

        plan.setUpdatedAt(LocalDateTime.now());

        return carePlanRepository.save(plan);
    }

    // Record a health outcome
    public CarePlan addOutcome(
            String planId,
            String metric,
            Double value,
            String unit,
            String notes,
            LocalDateTime recordedAt) {

        CarePlan plan = get(planId);

        if (metric == null || metric.isBlank()) {
            throw new IllegalArgumentException(
                    "Outcome metric is required.");
        }

        if (value == null || !Double.isFinite(value)) {
            throw new IllegalArgumentException(
                    "A finite outcome value is required.");
        }

        CarePlan.CarePlanOutcome outcome =
                new CarePlan.CarePlanOutcome();

        outcome.setMetric(metric.trim());
        outcome.setValue(value);
        outcome.setUnit(unit);
        outcome.setNotes(notes);

        outcome.setRecordedAt(
                recordedAt == null
                        ? LocalDateTime.now()
                        : recordedAt
        );

        plan.getOutcomes().add(outcome);
        plan.setUpdatedAt(LocalDateTime.now());

        return carePlanRepository.save(plan);
    }

    // Approve a care plan using a valid doctor ID
    public CarePlan approve(String planId, String approvedBy) {

        CarePlan plan = get(planId);

        if (approvedBy == null || approvedBy.isBlank()) {
            throw new IllegalArgumentException(
                    "Doctor ID is required for approval.");
        }

        String doctorId = approvedBy.trim();

        // Verify that the doctor exists in MongoDB
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Doctor not found. Please provide a valid doctor ID."));

        // Prevent accidental duplicate approval
        if ("APPROVED".equalsIgnoreCase(plan.getStatus())) {
            throw new IllegalArgumentException(
                    "This care plan has already been approved.");
        }

        // Save the doctor's ID, not the patient's ID
        plan.setApprovedBy(doctor.getId());
        plan.setApprovedAt(LocalDateTime.now());
        plan.setStatus("APPROVED");
        plan.setUpdatedAt(LocalDateTime.now());

        return carePlanRepository.save(plan);
    }
}