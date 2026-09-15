"""
MediSphere Clinical Guideline Validation / Rule Engine

Purpose:
    Validate whether AI risk predictions satisfy basic, transparent
    clinical-rule checks required for the MediSphere Milestone 2
    validation process.

Important:
    This is an educational / clinical decision-support validation
    component. It is NOT a medical diagnosis engine and must not be
    used as a substitute for professional medical judgment.
"""

from typing import Any, Dict, List


class ClinicalGuidelineValidator:
    """
    Transparent rule-based validator for MediSphere AI predictions.

    The validator does not change model predictions.
    It only evaluates whether the prediction and supplied patient
    information are internally consistent with predefined rules.
    """

    VERSION = "1.0.0"

    def __init__(self):
        self.rules = {
            "risk_probability_range": True,
            "risk_band_consistency": True,
            "required_patient_features": True,
            "clinical_alert_rules": True,
        }

    # =========================================================
    # Generic helpers
    # =========================================================

    @staticmethod
    def _valid_probability(value: Any) -> bool:
        try:
            probability = float(value)
            return 0.0 <= probability <= 1.0
        except (TypeError, ValueError):
            return False

    @staticmethod
    def _normalize_band(value: Any) -> str:
        if value is None:
            return ""

        return str(value).strip().upper()

    # =========================================================
    # Diabetes validation
    # =========================================================

    def validate_diabetes(
        self,
        patient_data: Dict[str, Any],
        prediction: Dict[str, Any],
    ) -> Dict[str, Any]:

        checks: List[Dict[str, Any]] = []

        required_fields = [
            "pregnancies",
            "glucose",
            "bloodpressure",
            "skinthickness",
            "insulin",
            "bmi",
            "diabetespedigreefunction",
            "age",
        ]

        missing_fields = [
            field
            for field in required_fields
            if field not in patient_data
            or patient_data[field] is None
        ]

        checks.append(
            {
                "rule": "required_patient_features",
                "status": "PASS" if not missing_fields else "FAIL",
                "details": (
                    "All required diabetes prediction features are present."
                    if not missing_fields
                    else f"Missing fields: {missing_fields}"
                ),
            }
        )

        probability = prediction.get("riskProbability")
        probability_valid = self._valid_probability(probability)

        checks.append(
            {
                "rule": "risk_probability_range",
                "status": "PASS" if probability_valid else "FAIL",
                "details": (
                    "Risk probability is within the valid 0-1 range."
                    if probability_valid
                    else "Risk probability must be between 0 and 1."
                ),
            }
        )

        band = self._normalize_band(
            prediction.get("riskBand")
        )

        expected_band = None

        if probability_valid:
            probability = float(probability)

            if probability < 0.30:
                expected_band = "LOW"
            elif probability < 0.60:
                expected_band = "MODERATE"
            else:
                expected_band = "HIGH"

        normalized_prediction_band = band.replace(
            "_SCORE",
            ""
        )

        band_consistent = (
            expected_band is not None
            and normalized_prediction_band == expected_band
        )

        checks.append(
            {
                "rule": "risk_band_consistency",
                "status": "PASS" if band_consistent else "FAIL",
                "details": (
                    f"Prediction band {band} matches "
                    f"probability-derived band {expected_band}."
                    if band_consistent
                    else (
                        f"Prediction band {band} does not match "
                        f"probability-derived band {expected_band}."
                    )
                ),
            }
        )

        alerts = self._diabetes_alert_rules(patient_data)

        checks.append(
            {
                "rule": "clinical_alert_rules",
                "status": "PASS",
                "details": (
                    "Transparent diabetes clinical alert rules "
                    "were evaluated."
                ),
            }
        )

        return self._build_result(
            model="diabetes",
            checks=checks,
            alerts=alerts,
        )

    # =========================================================
    # Cardiovascular validation
    # =========================================================

    def validate_cardiovascular(
        self,
        patient_data: Dict[str, Any],
        prediction: Dict[str, Any],
    ) -> Dict[str, Any]:

        checks: List[Dict[str, Any]] = []

        required_fields = [
            "age",
            "sex",
            "cp",
            "trestbps",
            "chol",
            "fbs",
            "restecg",
            "thalach",
            "exang",
            "oldpeak",
            "slope",
            "ca",
            "thal",
        ]

        missing_fields = [
            field
            for field in required_fields
            if field not in patient_data
            or patient_data[field] is None
        ]

        checks.append(
            {
                "rule": "required_patient_features",
                "status": "PASS" if not missing_fields else "FAIL",
                "details": (
                    "All required cardiovascular prediction features "
                    "are present."
                    if not missing_fields
                    else f"Missing fields: {missing_fields}"
                ),
            }
        )

        probability = prediction.get("riskProbability")
        probability_valid = self._valid_probability(probability)

        checks.append(
            {
                "rule": "risk_probability_range",
                "status": "PASS" if probability_valid else "FAIL",
                "details": (
                    "Risk probability is within the valid 0-1 range."
                    if probability_valid
                    else "Risk probability must be between 0 and 1."
                ),
            }
        )

        band = self._normalize_band(
            prediction.get("riskBand")
        )

        expected_band = None

        if probability_valid:
            probability = float(probability)

            if probability < 0.30:
                expected_band = "LOW_SCORE"
            elif probability < 0.60:
                expected_band = "MODERATE_SCORE"
            else:
                expected_band = "HIGH_SCORE"

        band_consistent = (
            expected_band is not None
            and band == expected_band
        )

        checks.append(
            {
                "rule": "risk_band_consistency",
                "status": "PASS" if band_consistent else "FAIL",
                "details": (
                    f"Prediction band {band} matches "
                    f"probability-derived band {expected_band}."
                    if band_consistent
                    else (
                        f"Prediction band {band} does not match "
                        f"probability-derived band {expected_band}."
                    )
                ),
            }
        )

        alerts = self._cardiovascular_alert_rules(patient_data)

        checks.append(
            {
                "rule": "clinical_alert_rules",
                "status": "PASS",
                "details": (
                    "Transparent cardiovascular clinical alert rules "
                    "were evaluated."
                ),
            }
        )

        return self._build_result(
            model="cardiovascular",
            checks=checks,
            alerts=alerts,
        )

    # =========================================================
    # Diabetes clinical alert rules
    # =========================================================

    @staticmethod
    def _diabetes_alert_rules(
        patient_data: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        alerts: List[Dict[str, Any]] = []

        try:
            glucose = float(patient_data["glucose"])

            if glucose >= 200:
                alerts.append(
                    {
                        "rule": "elevated_glucose",
                        "severity": "HIGH",
                        "message": (
                            "Glucose value is markedly elevated "
                            "and requires clinical review."
                        ),
                    }
                )

            elif glucose >= 126:
                alerts.append(
                    {
                        "rule": "elevated_glucose",
                        "severity": "MODERATE",
                        "message": (
                            "Glucose value is elevated and should "
                            "be reviewed clinically."
                        ),
                    }
                )

        except (KeyError, TypeError, ValueError):
            pass

        try:
            bmi = float(patient_data["bmi"])

            if bmi >= 30:
                alerts.append(
                    {
                        "rule": "elevated_bmi",
                        "severity": "MODERATE",
                        "message": (
                            "BMI is in an elevated range and may "
                            "warrant clinical/lifestyle assessment."
                        ),
                    }
                )

        except (KeyError, TypeError, ValueError):
            pass

        return alerts

    # =========================================================
    # Cardiovascular clinical alert rules
    # =========================================================

    @staticmethod
    def _cardiovascular_alert_rules(
        patient_data: Dict[str, Any],
    ) -> List[Dict[str, Any]]:

        alerts: List[Dict[str, Any]] = []

        try:
            blood_pressure = float(
                patient_data["trestbps"]
            )

            if blood_pressure >= 180:
                alerts.append(
                    {
                        "rule": "very_high_blood_pressure",
                        "severity": "HIGH",
                        "message": (
                            "Blood pressure value is very high "
                            "and requires prompt clinical review."
                        ),
                    }
                )

            elif blood_pressure >= 140:
                alerts.append(
                    {
                        "rule": "elevated_blood_pressure",
                        "severity": "MODERATE",
                        "message": (
                            "Blood pressure value is elevated "
                            "and should be reviewed clinically."
                        ),
                    }
                )

        except (KeyError, TypeError, ValueError):
            pass

        try:
            cholesterol = float(
                patient_data["chol"]
            )

            if cholesterol >= 240:
                alerts.append(
                    {
                        "rule": "elevated_cholesterol",
                        "severity": "MODERATE",
                        "message": (
                            "Cholesterol value is elevated and "
                            "may warrant clinical review."
                        ),
                    }
                )

        except (KeyError, TypeError, ValueError):
            pass

        return alerts

    # =========================================================
    # Result builder
    # =========================================================

    def _build_result(
        self,
        model: str,
        checks: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]],
    ) -> Dict[str, Any]:

        required_checks_pass = all(
            check["status"] == "PASS"
            for check in checks
            if check["rule"] != "clinical_alert_rules"
        )

        return {
            "validator": (
                "MediSphere Clinical Guideline Validator"
            ),
            "version": self.VERSION,
            "model": model,
            "status": (
                "PASS"
                if required_checks_pass
                else "REVIEW_REQUIRED"
            ),
            "checks": checks,
            "alerts": alerts,
            "alertCount": len(alerts),
            "medicalDisclaimer": (
                "This rule engine is an educational and "
                "clinical decision-support validation component. "
                "It is not a medical diagnosis and does not "
                "replace professional clinical judgment."
            ),
        }