import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from AI.app.validation.clinical_guideline_validator import (
    ClinicalGuidelineValidator,
)


validator = ClinicalGuidelineValidator()


# ---------------------------------------------------------
# Diabetes test
# ---------------------------------------------------------

diabetes_patient = {
    "pregnancies": 2,
    "glucose": 145,
    "bloodpressure": 80,
    "skinthickness": 25,
    "insulin": 120,
    "bmi": 31.5,
    "diabetespedigreefunction": 0.5,
    "age": 45,
}

diabetes_prediction = {
    "riskProbability": 0.448,
    "riskBand": "MODERATE",
}

diabetes_result = validator.validate_diabetes(
    diabetes_patient,
    diabetes_prediction,
)


print("=" * 60)
print("DIABETES CLINICAL GUIDELINE VALIDATION")
print("=" * 60)
print(diabetes_result)


# ---------------------------------------------------------
# Cardiovascular test
# ---------------------------------------------------------

cardiovascular_patient = {
    "age": 63,
    "sex": 1,
    "cp": 1,
    "trestbps": 145,
    "chol": 233,
    "fbs": 1,
    "restecg": 2,
    "thalach": 150,
    "exang": 0,
    "oldpeak": 2.3,
    "slope": 3,
    "ca": 0,
    "thal": 6,
}

cardiovascular_prediction = {
    "riskProbability": 0.43764,
    "riskBand": "MODERATE_SCORE",
}

cardiovascular_result = validator.validate_cardiovascular(
    cardiovascular_patient,
    cardiovascular_prediction,
)


print()
print("=" * 60)
print("CARDIOVASCULAR CLINICAL GUIDELINE VALIDATION")
print("=" * 60)
print(cardiovascular_result)


# ---------------------------------------------------------
# Final result
# ---------------------------------------------------------

print()
print("=" * 60)
print("CLINICAL GUIDELINE VALIDATION TEST COMPLETE")
print("=" * 60)

if (
    diabetes_result["status"] == "PASS"
    and cardiovascular_result["status"] == "PASS"
):
    print("Overall status: PASS")
else:
    print("Overall status: REVIEW_REQUIRED")