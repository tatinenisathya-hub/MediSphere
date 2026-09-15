"""
MediSphere Milestone 2 Validation Layer

Validates:

1. Cardiovascular risk model
2. Diabetes risk model
3. SHAP explainability
4. Prediction calibration
5. Bias across demographic groups
6. Federated learning clients and convergence
7. Clinical guideline validation

IMPORTANT:
    This script validates existing saved models.
    It does NOT retrain models.
    It does NOT modify saved model weights.
    It does NOT modify model metadata.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    brier_score_loss,
)

from sklearn.model_selection import train_test_split

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout


# ============================================================
# PROJECT PATH SETUP
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

AI_ROOT = PROJECT_ROOT / "AI"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

if str(AI_ROOT) not in sys.path:
    sys.path.insert(0, str(AI_ROOT))


# ============================================================
# MEDISPHERE IMPORTS
# ============================================================

from AI.app.diabetes_predictor import (
    DiabetesPredictor,
)

from AI.app.cardiovascular_predictor import (
    CardiovascularPredictor,
)

from AI.app.validation.clinical_guideline_validator import (
    ClinicalGuidelineValidator,
)


# ============================================================
# PATHS
# ============================================================

DATA_ROOT = AI_ROOT / "data"

RAW_DATA_ROOT = DATA_ROOT / "raw"

MODEL_ROOT = AI_ROOT / "saved_models"


# ------------------------------------------------------------
# Cardiovascular files
# ------------------------------------------------------------

CVD_DATASET = (
    RAW_DATA_ROOT
    / "cardiovascular_synthetic.csv"
)

CVD_WEIGHTS = (
    MODEL_ROOT
    / "cardiovascular_federated.weights.h5"
)

CVD_SCALER = (
    MODEL_ROOT
    / "cardiovascular_scaler.joblib"
)

CVD_METADATA = (
    MODEL_ROOT
    / "cardiovascular_metadata.json"
)

CVD_CALIBRATOR = (
    MODEL_ROOT
    / "cardiovascular_calibrator.joblib"
)


# ------------------------------------------------------------
# Diabetes files
# ------------------------------------------------------------

DIABETES_DATASET = (
    DATA_ROOT
    / "diabetes_synthetic_v4.csv"
)

DIABETES_WEIGHTS = (
    MODEL_ROOT
    / "diabetes_federated.weights.h5"
)

DIABETES_SCALER = (
    MODEL_ROOT
    / "diabetes_scaler.joblib"
)

DIABETES_METADATA = (
    MODEL_ROOT
    / "diabetes_metadata.json"
)


# ============================================================
# FEATURE DEFINITIONS
# ============================================================

CVD_FEATURES = [
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


DIABETES_FEATURES = [
    "pregnancies",
    "glucose",
    "bloodpressure",
    "skinthickness",
    "insulin",
    "bmi",
    "diabetespedigreefunction",
    "age",
]


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def load_json(path):
    """
    Load JSON metadata from disk.
    """

    with open(
        path,
        "r",
        encoding="utf-8",
    ) as file:

        return json.load(file)


# ============================================================
# EXPECTED CALIBRATION ERROR
# ============================================================

def calculate_ece(
    y_true,
    probabilities,
    number_of_bins=10,
):
    """
    Calculate Expected Calibration Error.

    ECE is used as an engineering validation metric.
    """

    y_true = np.asarray(
        y_true
    )

    probabilities = np.asarray(
        probabilities
    )

    bins = np.linspace(
        0.0,
        1.0,
        number_of_bins + 1,
    )

    ece = 0.0

    for index in range(
        number_of_bins
    ):

        lower = bins[index]
        upper = bins[index + 1]

        if index == number_of_bins - 1:

            mask = (
                (probabilities >= lower)
                &
                (probabilities <= upper)
            )

        else:

            mask = (
                (probabilities >= lower)
                &
                (probabilities < upper)
            )

        if not np.any(mask):
            continue

        bin_accuracy = np.mean(
            y_true[mask]
        )

        bin_confidence = np.mean(
            probabilities[mask]
        )

        bin_fraction = np.mean(
            mask
        )

        ece += (
            abs(
                bin_accuracy
                - bin_confidence
            )
            * bin_fraction
        )

    return float(ece)


# ============================================================
# CVD PLATT CALIBRATION
# ============================================================

def calibrate_cvd_probabilities(
    probabilities,
    calibrator,
):
    """
    Apply the saved CVD Platt-scaling calibrator.

    Calibrator artifact:

        coefficient
        intercept

    Formula:

        raw_logit =
            log(p / (1 - p))

        calibrated_logit =
            coefficient * raw_logit
            + intercept

        calibrated_probability =
            sigmoid(calibrated_logit)
    """

    probabilities = np.asarray(
        probabilities,
        dtype=np.float64,
    )

    probabilities = np.clip(
        probabilities,
        0.0,
        1.0,
    )

    clipped_probabilities = np.clip(
        probabilities,
        1e-7,
        1.0 - 1e-7,
    )

    raw_logits = np.log(
        clipped_probabilities
        /
        (
            1.0
            - clipped_probabilities
        )
    )

    coefficient = float(
        calibrator["coefficient"]
    )

    intercept = float(
        calibrator["intercept"]
    )

    calibrated_logits = (
        coefficient
        * raw_logits
        + intercept
    )

    calibrated_probabilities = np.empty_like(
        calibrated_logits
    )

    # --------------------------------------------------------
    # Numerically stable sigmoid
    # --------------------------------------------------------

    positive_mask = (
        calibrated_logits >= 0
    )

    calibrated_probabilities[
        positive_mask
    ] = (
        1.0
        /
        (
            1.0
            +
            np.exp(
                -calibrated_logits[
                    positive_mask
                ]
            )
        )
    )

    negative_logits = (
        calibrated_logits[
            ~positive_mask
        ]
    )

    exp_values = np.exp(
        negative_logits
    )

    calibrated_probabilities[
        ~positive_mask
    ] = (
        exp_values
        /
        (
            1.0
            + exp_values
        )
    )

    return np.clip(
        calibrated_probabilities,
        0.0,
        1.0,
    )


# ============================================================
# DATASET LOADERS
# ============================================================

def load_cvd_dataset():
    """
    Load the MediSphere synthetic cardiovascular dataset.

    The target column is:

        cvd_target
    """

    dataframe = pd.read_csv(
        CVD_DATASET
    )

    if "cvd_target" in dataframe.columns:

        dataframe = dataframe.rename(
            columns={
                "cvd_target": "target"
            }
        )

    required_columns = (
        CVD_FEATURES
        + ["target"]
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataframe.columns
    ]

    if missing_columns:

        raise ValueError(
            "CVD dataset is missing required "
            "columns: "
            + ", ".join(
                missing_columns
            )
        )

    dataframe = dataframe[
        required_columns
    ].copy()

    dataframe = dataframe.dropna()

    dataframe["target"] = pd.to_numeric(
        dataframe["target"],
        errors="coerce",
    )

    dataframe = dataframe.dropna(
        subset=["target"]
    )

    dataframe["target"] = (
        dataframe["target"]
        .astype(int)
        .clip(0, 1)
    )

    return dataframe


# ------------------------------------------------------------
# Diabetes v4
# ------------------------------------------------------------

def load_diabetes_dataset():
    """
    Load the MediSphere Diabetes v4 synthetic dataset.

    Expected source columns:

        pregnancies
        glucose
        bloodPressure
        skinThickness
        insulin
        bmi
        diabetesPedigree
        age
        outcome
    """

    dataframe = pd.read_csv(
        DIABETES_DATASET
    )

    rename_map = {
        "bloodPressure":
            "bloodpressure",

        "skinThickness":
            "skinthickness",

        "diabetesPedigree":
            "diabetespedigreefunction",

        "diabetesPedigreeFunction":
            "diabetespedigreefunction",
    }

    dataframe = dataframe.rename(
        columns=rename_map
    )

    required_columns = (
        DIABETES_FEATURES
        + ["outcome"]
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in dataframe.columns
    ]

    if missing_columns:

        raise ValueError(
            "Diabetes v4 dataset is missing "
            "required columns: "
            + ", ".join(
                missing_columns
            )
        )

    dataframe = dataframe[
        required_columns
    ].copy()

    dataframe = dataframe.dropna()

    dataframe["outcome"] = pd.to_numeric(
        dataframe["outcome"],
        errors="coerce",
    )

    dataframe = dataframe.dropna(
        subset=["outcome"]
    )

    dataframe["outcome"] = (
        dataframe["outcome"]
        .astype(int)
        .clip(0, 1)
    )

    return dataframe


# ============================================================
# MODEL ARCHITECTURES
# ============================================================

def build_cardiovascular_validation_model():
    """
    Build the exact CVD v2.0.0 architecture.

    13
      -> Dense(64, ReLU)
      -> Dropout(0.10)
      -> Dense(32, ReLU)
      -> Dropout(0.10)
      -> Dense(16, ReLU)
      -> Dense(1, sigmoid)
    """

    model = Sequential(
        [
            Dense(
                64,
                activation="relu",
                input_shape=(
                    len(CVD_FEATURES),
                ),
            ),

            Dropout(
                0.10
            ),

            Dense(
                32,
                activation="relu",
            ),

            Dropout(
                0.10
            ),

            Dense(
                16,
                activation="relu",
            ),

            Dense(
                1,
                activation="sigmoid",
            ),
        ]
    )

    return model


def build_diabetes_validation_model():
    """
    Build the exact Diabetes v4 architecture.

    8
      -> Dense(32, ReLU)
      -> Dropout(0.05)
      -> Dense(16, ReLU)
      -> Dropout(0.05)
      -> Dense(1, sigmoid)
    """

    model = Sequential(
        [
            Dense(
                32,
                activation="relu",
                input_shape=(8,),
            ),

            Dropout(
                0.05
            ),

            Dense(
                16,
                activation="relu",
            ),

            Dropout(
                0.05
            ),

            Dense(
                1,
                activation="sigmoid",
            ),
        ]
    )

    return model


# ============================================================
# CARDIOVASCULAR MODEL VALIDATION
# ============================================================

def validate_cardiovascular_model():

    print()
    print("=" * 60)
    print("CARDIOVASCULAR MODEL VALIDATION")
    print("=" * 60)

    # --------------------------------------------------------
    # Metadata
    # --------------------------------------------------------

    metadata = load_json(
        CVD_METADATA
    )

    model_version = metadata.get(
        "version",
        metadata.get(
            "modelVersion",
            "UNKNOWN",
        ),
    )

    print(
        "Model version:",
        model_version,
    )

    clients = metadata.get(
        "number_of_clients",
        metadata.get(
            "numClients",
            "UNKNOWN",
        ),
    )

    print(
        "Clients:",
        clients,
    )

    federated_rounds = metadata.get(
        "number_of_rounds",
        metadata.get(
            "federatedRounds",
            metadata.get(
                "federated_rounds",
                "UNKNOWN",
            ),
        ),
    )

    print(
        "Federated rounds:",
        federated_rounds,
    )

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    dataframe = load_cvd_dataset()

    X = dataframe[
        CVD_FEATURES
    ]

    y = dataframe[
        "target"
    ]

    (
        X_train,
        X_test,
        y_train,
        y_test,
    ) = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    # --------------------------------------------------------
    # Load scaler
    # --------------------------------------------------------

    scaler = joblib.load(
        CVD_SCALER
    )

    X_test_scaled = scaler.transform(
        X_test.to_numpy()
    )

    # --------------------------------------------------------
    # Build exact model
    # --------------------------------------------------------

    model = (
        build_cardiovascular_validation_model()
    )

    model.load_weights(
        CVD_WEIGHTS
    )

    # ========================================================
    # LOAD CVD CALIBRATOR
    # ========================================================

    if not CVD_CALIBRATOR.exists():

        raise FileNotFoundError(
            "CVD probability calibrator not found: "
            f"{CVD_CALIBRATOR}"
        )

    cvd_calibrator = joblib.load(
        CVD_CALIBRATOR
    )

    if not isinstance(
        cvd_calibrator,
        dict,
    ):

        raise ValueError(
            "Invalid CVD calibrator artifact. "
            "Expected a dictionary."
        )

    if (
        "coefficient"
        not in cvd_calibrator
        or
        "intercept"
        not in cvd_calibrator
    ):

        raise ValueError(
            "CVD calibrator artifact is missing "
            "coefficient or intercept."
        )

    print(
        "CVD probability calibrator loaded."
    )

    print(
        "Calibration method:",
        cvd_calibrator.get(
            "method",
            "platt_scaling",
        ),
    )

    print(
        "Platt coefficient:",
        f"{float(cvd_calibrator['coefficient']):.6f}",
    )

    print(
        "Platt intercept:",
        f"{float(cvd_calibrator['intercept']):.6f}",
    )

    # ========================================================
    # RAW MODEL PREDICTIONS
    # ========================================================

    raw_probabilities = (
        model.predict(
            X_test_scaled,
            verbose=0,
        )
        .reshape(-1)
    )

    # ========================================================
    # CALIBRATED PROBABILITIES
    # ========================================================

    probabilities = (
        calibrate_cvd_probabilities(
            raw_probabilities,
            cvd_calibrator,
        )
    )

    predictions = (
        probabilities >= 0.5
    ).astype(int)

    # ========================================================
    # METRICS
    # ========================================================

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    try:

        roc_auc = roc_auc_score(
            y_test,
            probabilities,
        )

    except ValueError:

        roc_auc = float("nan")

    # --------------------------------------------------------
    # Raw calibration metrics
    # --------------------------------------------------------

    raw_brier = brier_score_loss(
        y_test,
        raw_probabilities,
    )

    raw_ece = calculate_ece(
        y_test,
        raw_probabilities,
    )

    # --------------------------------------------------------
    # Calibrated metrics
    # --------------------------------------------------------

    calibrated_brier = brier_score_loss(
        y_test,
        probabilities,
    )

    calibrated_ece = calculate_ece(
        y_test,
        probabilities,
    )

    print(
        "Validation test samples:",
        len(y_test),
    )

    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print(
        f"ROC-AUC: {roc_auc:.4f}"
    )

    print(
        f"Raw Brier score: {raw_brier:.4f}"
    )

    print(
        f"Calibrated Brier score: "
        f"{calibrated_brier:.4f}"
    )

    print(
        f"Raw ECE: {raw_ece:.4f}"
    )

    print(
        f"Calibrated ECE: "
        f"{calibrated_ece:.4f}"
    )

    # Keep ECE label explicit for the
    # validation decision.

    print(
        f"ECE: {calibrated_ece:.4f}"
    )

    # ========================================================
    # ACCURACY VALIDATION
    # ========================================================

    accuracy_status = (
        "PASS"
        if accuracy > 0.90
        else "FAIL"
    )

    # ========================================================
    # CALIBRATION VALIDATION
    # ========================================================

    calibration_status = (
        "PASS"
        if calibrated_ece <= 0.10
        else "REVIEW_REQUIRED"
    )

    print(
        "Accuracy > 90%:",
        accuracy_status,
    )

    print(
        "Calibration:",
        calibration_status,
    )

    # ========================================================
    # BIAS AUDIT BY SEX
    # ========================================================

    print()
    print(
        "Bias audit by sex:"
    )

    full_scaled = scaler.transform(
        X.to_numpy()
    )

    full_raw_probabilities = (
        model.predict(
            full_scaled,
            verbose=0,
        )
        .reshape(-1)
    )

    full_probabilities = (
        calibrate_cvd_probabilities(
            full_raw_probabilities,
            cvd_calibrator,
        )
    )

    full_predictions = (
        full_probabilities >= 0.5
    ).astype(int)

    sex_values = sorted(
        dataframe["sex"].unique()
    )

    group_accuracies = []

    for sex in sex_values:

        mask = (
            dataframe["sex"]
            == sex
        )

        group_accuracy = accuracy_score(
            y[mask],
            full_predictions[mask],
        )

        positive_rate = float(
            np.mean(
                full_predictions[mask]
            )
        )

        group_accuracies.append(
            group_accuracy
        )

        print(
            f"  Group {sex}: "
            f"samples={int(mask.sum())}, "
            f"accuracy={group_accuracy:.4f}, "
            f"positiveRate={positive_rate:.4f}"
        )

    if group_accuracies:

        accuracy_gap = (
            max(group_accuracies)
            - min(group_accuracies)
        )

    else:

        accuracy_gap = 0.0

    bias_status = (
        "PASS"
        if accuracy_gap <= 0.10
        else "REVIEW_REQUIRED"
    )

    print(
        f"Accuracy gap: {accuracy_gap:.4f}"
    )

    print(
        "Bias status:",
        bias_status,
    )

    # ========================================================
    # CVD SHAP VALIDATION
    # ========================================================

    try:

        print(
            "Initializing CardiovascularPredictor..."
        )

        predictor = (
            CardiovascularPredictor()
        )

        cvd_patient = {
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

        print(
            "Calculating cardiovascular prediction "
            "with SHAP explanation..."
        )

        shap_result = predictor.predict(
            cvd_patient
        )

        feature_contributions = (
            shap_result.get(
                "featureContributions",
                []
            )
        )

        shap_valid = (
            len(feature_contributions)
            == len(CVD_FEATURES)
        )

        if shap_valid:

            for contribution in (
                feature_contributions
            ):

                if (
                    "shapValue"
                    not in contribution
                    or
                    "direction"
                    not in contribution
                ):

                    shap_valid = False
                    break

        print()

        print(
            "SHAP validity:",
            "PASS"
            if shap_valid
            else "FAIL",
        )

        if shap_valid:

            print(
                "SHAP detail:",
                f"{len(feature_contributions)} "
                "CVD feature contributions with "
                "valid SHAP values and direction "
                "fields returned successfully.",
            )

        else:

            print(
                "SHAP detail:",
                "Invalid or incomplete CVD SHAP output.",
            )

    except Exception as exception:

        shap_valid = False

        print()
        print(
            "SHAP validity: FAIL"
        )

        print(
            "SHAP error:",
            exception,
        )

    return {
        "accuracy": accuracy,
        "roc_auc": roc_auc,
        "brier": calibrated_brier,
        "ece": calibrated_ece,
        "raw_brier": raw_brier,
        "raw_ece": raw_ece,
        "accuracy_status": accuracy_status,
        "calibration_status": calibration_status,
        "bias_status": bias_status,
        "shap_status": (
            "PASS"
            if shap_valid
            else "FAIL"
        ),
    }


# ============================================================
# DIABETES MODEL VALIDATION
# ============================================================

def validate_diabetes_model():

    print()
    print("=" * 60)
    print("DIABETES MODEL VALIDATION")
    print("=" * 60)

    # --------------------------------------------------------
    # Metadata
    # --------------------------------------------------------

    metadata = load_json(
        DIABETES_METADATA
    )

    model_version = metadata.get(
        "version",
        metadata.get(
            "modelVersion",
            "UNKNOWN",
        ),
    )

    print(
        "Model version:",
        model_version,
    )

    clients = metadata.get(
        "numClients",
        metadata.get(
            "number_of_clients",
            "UNKNOWN",
        ),
    )

    print(
        "Clients:",
        clients,
    )

    federated_rounds = metadata.get(
        "federatedRounds",
        metadata.get(
            "number_of_rounds",
            metadata.get(
                "federated_rounds",
                "UNKNOWN",
            ),
        ),
    )

    print(
        "Federated rounds:",
        federated_rounds,
    )

    # --------------------------------------------------------
    # Dataset
    # --------------------------------------------------------

    dataframe = (
        load_diabetes_dataset()
    )

    X = dataframe[
        DIABETES_FEATURES
    ]

    y = dataframe[
        "outcome"
    ]

    (
        X_train,
        X_test,
        y_train,
        y_test,
    ) = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    # --------------------------------------------------------
    # Scaler
    # --------------------------------------------------------

    scaler = joblib.load(
        DIABETES_SCALER
    )

    X_test_scaled = scaler.transform(
        X_test
    )

    # --------------------------------------------------------
    # Exact Diabetes v4 model
    # --------------------------------------------------------

    model = (
        build_diabetes_validation_model()
    )

    model.load_weights(
        DIABETES_WEIGHTS
    )

    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    probabilities = (
        model.predict(
            X_test_scaled,
            verbose=0,
        )
        .reshape(-1)
    )

    predictions = (
        probabilities >= 0.5
    ).astype(int)

    # ========================================================
    # METRICS
    # ========================================================

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    try:

        roc_auc = roc_auc_score(
            y_test,
            probabilities,
        )

    except ValueError:

        roc_auc = float("nan")

    brier = brier_score_loss(
        y_test,
        probabilities,
    )

    ece = calculate_ece(
        y_test,
        probabilities,
    )

    print(
        "Validation test samples:",
        len(y_test),
    )

    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print(
        f"ROC-AUC: {roc_auc:.4f}"
    )

    print(
        f"Brier score: {brier:.4f}"
    )

    print(
        f"ECE: {ece:.4f}"
    )

    # --------------------------------------------------------
    # Accuracy
    # --------------------------------------------------------

    accuracy_status = (
        "PASS"
        if accuracy > 0.90
        else "FAIL"
    )

    # --------------------------------------------------------
    # Calibration
    # --------------------------------------------------------

    calibration_status = (
        "PASS"
        if ece <= 0.10
        else "REVIEW_REQUIRED"
    )

    print(
        "Accuracy > 90%:",
        accuracy_status,
    )

    print(
        "Calibration:",
        calibration_status,
    )

    # ========================================================
    # BIAS AUDIT BY AGE
    # ========================================================

    print()
    print(
        "Bias audit by age group:"
    )

    full_scaled = scaler.transform(
        X
    )

    full_probabilities = (
        model.predict(
            full_scaled,
            verbose=0,
        )
        .reshape(-1)
    )

    full_predictions = (
        full_probabilities >= 0.5
    ).astype(int)

    age_groups = {

        "18-30": (
            dataframe["age"] >= 18
        )
        &
        (
            dataframe["age"] <= 30
        ),

        "31-50": (
            dataframe["age"] >= 31
        )
        &
        (
            dataframe["age"] <= 50
        ),

        "51+": (
            dataframe["age"] >= 51
        ),
    }

    group_accuracies = []

    for group_name, mask in (
        age_groups.items()
    ):

        if not np.any(mask):
            continue

        group_accuracy = accuracy_score(
            y[mask],
            full_predictions[mask],
        )

        positive_rate = float(
            np.mean(
                full_predictions[mask]
            )
        )

        group_accuracies.append(
            group_accuracy
        )

        print(
            f"  {group_name}: "
            f"samples={int(mask.sum())}, "
            f"accuracy={group_accuracy:.4f}, "
            f"positiveRate={positive_rate:.4f}"
        )

    if group_accuracies:

        accuracy_gap = (
            max(group_accuracies)
            - min(group_accuracies)
        )

    else:

        accuracy_gap = 0.0

    bias_status = (
        "PASS"
        if accuracy_gap <= 0.10
        else "REVIEW_REQUIRED"
    )

    print(
        f"Accuracy gap: {accuracy_gap:.4f}"
    )

    print(
        "Bias status:",
        bias_status,
    )

    # ========================================================
    # DIABETES SHAP VALIDATION
    # ========================================================

    try:

        predictor = (
            DiabetesPredictor()
        )

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

        shap_result = predictor.explain(
            diabetes_patient
        )

        feature_contributions = (
            shap_result.get(
                "featureContributions",
                []
            )
        )

        shap_valid = (
            len(feature_contributions)
            == len(DIABETES_FEATURES)
        )

        if shap_valid:

            for contribution in (
                feature_contributions
            ):

                if (
                    "contribution"
                    not in contribution
                    or
                    "direction"
                    not in contribution
                ):

                    shap_valid = False
                    break

        print()

        print(
            "SHAP validity:",
            "PASS"
            if shap_valid
            else "FAIL",
        )

        if shap_valid:

            print(
                "SHAP detail:",
                f"{len(feature_contributions)} "
                "feature contributions with valid "
                "direction fields returned successfully.",
            )

        else:

            print(
                "SHAP detail:",
                "Invalid or incomplete diabetes SHAP output.",
            )

    except Exception as exception:

        shap_valid = False

        print()

        print(
            "SHAP validity: FAIL"
        )

        print(
            "SHAP error:",
            exception,
        )

    return {
        "accuracy": accuracy,
        "roc_auc": roc_auc,
        "brier": brier,
        "ece": ece,
        "accuracy_status": accuracy_status,
        "calibration_status": calibration_status,
        "bias_status": bias_status,
        "shap_status": (
            "PASS"
            if shap_valid
            else "FAIL"
        ),
    }


# ============================================================
# FEDERATED CONVERGENCE VALIDATION
# ============================================================

def validate_convergence(
    metadata,
    model_name,
    expected_rounds,
):
    """
    Validate federated-learning convergence.

    Supports the following metadata layouts:

        metadata["convergence"]

        metadata["federated_convergence"]

        metadata["federatedConvergence"]

    Round metrics may be stored as:

        metadata["round_metrics"]

        metadata["roundMetrics"]

        convergence["round_metrics"]

        convergence["roundMetrics"]
    """

    # --------------------------------------------------------
    # Locate convergence metadata
    # --------------------------------------------------------

    convergence = metadata.get(
        "federated_convergence"
    )

    if convergence is None:

        convergence = metadata.get(
            "federatedConvergence"
        )

    if convergence is None:

        convergence = metadata.get(
            "convergence"
        )

    print()
    print(
        f"{model_name} convergence:"
    )

    if not isinstance(
        convergence,
        dict,
    ):

        print(
            "  Convergence metadata: FAIL"
        )

        print(
            "  Reason: Federated convergence "
            "metadata not found."
        )

        return "FAIL"

    # ========================================================
    # CLIENT VALIDATION
    # ========================================================

    clients = metadata.get(
        "number_of_clients"
    )

    if clients is None:

        clients = metadata.get(
            "numClients"
        )

    if clients is None:

        clients = metadata.get(
            "clients"
        )

    print(
        f"  Clients: {clients}"
    )

    client_status = (
        "PASS"
        if clients == 3
        else "FAIL"
    )

    print(
        "  Client validation:",
        client_status,
    )

    # ========================================================
    # ROUND METRICS
    # ========================================================

    round_metrics = metadata.get(
        "round_metrics"
    )

    if round_metrics is None:

        round_metrics = metadata.get(
            "roundMetrics"
        )

    if round_metrics is None:

        round_metrics = convergence.get(
            "round_metrics"
        )

    if round_metrics is None:

        round_metrics = convergence.get(
            "roundMetrics"
        )

    if not isinstance(
        round_metrics,
        list,
    ):

        print(
            "  Round metric validation: FAIL"
        )

        print(
            "  Reason: No federated round "
            "metrics found."
        )

        return "FAIL"

    # ========================================================
    # RECORDED ROUND COUNT
    # ========================================================

    recorded_rounds = len(
        round_metrics
    )

    print(
        f"  Recorded rounds: "
        f"{recorded_rounds}"
    )

    round_count_status = (
        "PASS"
        if recorded_rounds
        == expected_rounds
        else "FAIL"
    )

    print(
        "  Round count validation:",
        round_count_status,
    )

    # ========================================================
    # ROUND METRIC VALIDATION
    # ========================================================

    metrics_valid = True

    for metric in round_metrics:

        if not isinstance(
            metric,
            dict,
        ):

            metrics_valid = False
            break

        required_keys = [
            "round",
            "loss",
            "accuracy",
        ]

        if not all(
            key in metric
            for key in required_keys
        ):

            metrics_valid = False
            break

        try:

            round_number = int(
                metric["round"]
            )

            loss = float(
                metric["loss"]
            )

            accuracy = float(
                metric["accuracy"]
            )

        except (
            TypeError,
            ValueError,
        ):

            metrics_valid = False
            break

        if not np.isfinite(
            loss
        ):

            metrics_valid = False
            break

        if not np.isfinite(
            accuracy
        ):

            metrics_valid = False
            break

        if (
            accuracy < 0.0
            or
            accuracy > 1.0
        ):

            metrics_valid = False
            break

    print(
        "  Round metric validation:",
        "PASS"
        if metrics_valid
        else "FAIL",
    )

    # ========================================================
    # ROUND NUMBERING
    # ========================================================

    numbering_valid = True

    expected_numbers = list(
        range(
            1,
            recorded_rounds + 1,
        )
    )

    if metrics_valid:

        actual_numbers = [
            int(
                metric["round"]
            )
            for metric in round_metrics
        ]

        numbering_valid = (
            actual_numbers
            == expected_numbers
        )

    else:

        numbering_valid = False

    print(
        "  Round numbering validation:",
        "PASS"
        if numbering_valid
        else "FAIL",
    )

    # ========================================================
    # BASIC VALIDATION
    # ========================================================

    if not (
        client_status == "PASS"
        and
        round_count_status == "PASS"
        and
        metrics_valid
        and
        numbering_valid
    ):

        print(
            "  Convergence status: FAIL"
        )

        return "FAIL"

    # ========================================================
    # ROUND HISTORY
    # ========================================================

    print()
    print(
        "  Round history:"
    )

    for metric in round_metrics:

        print(
            f"    Round {int(metric['round'])}: "
            f"loss={float(metric['loss']):.4f}, "
            f"accuracy={float(metric['accuracy']):.4f}"
        )

    # ========================================================
    # CALCULATED CONVERGENCE
    # ========================================================

    initial_loss = float(
        round_metrics[0]["loss"]
    )

    final_loss = float(
        round_metrics[-1]["loss"]
    )

    initial_accuracy = float(
        round_metrics[0]["accuracy"]
    )

    final_accuracy = float(
        round_metrics[-1]["accuracy"]
    )

    loss_reduction = (
        initial_loss
        - final_loss
    )

    accuracy_change = (
        final_accuracy
        - initial_accuracy
    )

    # ========================================================
    # METADATA CONSISTENCY CHECK
    # ========================================================

    metadata_status = convergence.get(
        "status"
    )

    metadata_rounds = convergence.get(
        "rounds"
    )

    metadata_first_accuracy = (
        convergence.get(
            "first_round_accuracy"
        )
    )

    metadata_last_accuracy = (
        convergence.get(
            "last_round_accuracy"
        )
    )

    metadata_accuracy_change = (
        convergence.get(
            "accuracy_change"
        )
    )

    metadata_first_loss = (
        convergence.get(
            "first_round_loss"
        )
    )

    metadata_last_loss = (
        convergence.get(
            "last_round_loss"
        )
    )

    metadata_loss_change = (
        convergence.get(
            "loss_change"
        )
    )

    metadata_consistency = True

    tolerance = 1e-6

    # --------------------------------------------------------
    # Round count
    # --------------------------------------------------------

    if metadata_rounds is not None:

        try:

            if int(
                metadata_rounds
            ) != recorded_rounds:

                metadata_consistency = False

        except (
            TypeError,
            ValueError,
        ):

            metadata_consistency = False

    # --------------------------------------------------------
    # Accuracy consistency
    # --------------------------------------------------------

    metadata_pairs = [

        (
            metadata_first_accuracy,
            initial_accuracy,
        ),

        (
            metadata_last_accuracy,
            final_accuracy,
        ),

        (
            metadata_accuracy_change,
            accuracy_change,
        ),

        (
            metadata_first_loss,
            initial_loss,
        ),

        (
            metadata_last_loss,
            final_loss,
        ),

        (
            metadata_loss_change,
            -loss_reduction,
        ),
    ]

    for (
        metadata_value,
        calculated_value,
    ) in metadata_pairs:

        if metadata_value is None:
            continue

        try:

            if (
                abs(
                    float(metadata_value)
                    - float(calculated_value)
                )
                > tolerance
            ):

                metadata_consistency = False

        except (
            TypeError,
            ValueError,
        ):

            metadata_consistency = False

    print()
    print(
        "  Convergence metadata consistency:",
        "PASS"
        if metadata_consistency
        else "REVIEW_REQUIRED",
    )

    if metadata_status is not None:

        print(
            "  Recorded metadata status:",
            metadata_status,
        )

    # ========================================================
    # CONVERGENCE VALUES
    # ========================================================

    print()
    print(
        f"  Initial loss: "
        f"{initial_loss:.4f}"
    )

    print(
        f"  Final loss: "
        f"{final_loss:.4f}"
    )

    print(
        f"  Loss reduction: "
        f"{loss_reduction:.4f}"
    )

    print(
        f"  Initial accuracy: "
        f"{initial_accuracy:.4f}"
    )

    print(
        f"  Final accuracy: "
        f"{final_accuracy:.4f}"
    )

    print(
        f"  Accuracy change: "
        f"{accuracy_change:.4f}"
    )

    # ========================================================
    # FINAL CONVERGENCE DECISION
    # ========================================================

    if (
        loss_reduction > 0
        and
        accuracy_change >= 0
    ):

        convergence_status = (
            "IMPROVED"
        )

    else:

        convergence_status = (
            "REVIEW_REQUIRED"
        )

    print(
        "  Convergence status:",
        convergence_status,
    )

    return convergence_status


# ============================================================
# FEDERATED TRAINING VALIDATION
# ============================================================

def validate_federated_training():

    print()
    print("=" * 60)
    print("FEDERATED TRAINING VALIDATION")
    print("=" * 60)

    cvd_metadata = load_json(
        CVD_METADATA
    )

    diabetes_metadata = load_json(
        DIABETES_METADATA
    )

    # --------------------------------------------------------
    # CVD expected rounds
    # --------------------------------------------------------

    cvd_rounds = metadata_rounds(
        cvd_metadata,
        [
            "number_of_rounds",
            "federatedRounds",
            "federated_rounds",
        ],
        10,
    )

    # --------------------------------------------------------
    # Diabetes expected rounds
    # --------------------------------------------------------

    diabetes_rounds = metadata_rounds(
        diabetes_metadata,
        [
            "federatedRounds",
            "number_of_rounds",
            "federated_rounds",
        ],
        20,
    )

    # --------------------------------------------------------
    # CVD
    # --------------------------------------------------------

    cvd_status = validate_convergence(
        metadata=cvd_metadata,
        model_name="CVD",
        expected_rounds=cvd_rounds,
    )

    # --------------------------------------------------------
    # Diabetes
    # --------------------------------------------------------

    diabetes_status = validate_convergence(
        metadata=diabetes_metadata,
        model_name="Diabetes",
        expected_rounds=diabetes_rounds,
    )

    return {
        "cvd": cvd_status,
        "diabetes": diabetes_status,
    }


# ============================================================
# METADATA ROUND HELPER
# ============================================================

def metadata_rounds(
    metadata,
    keys,
    default,
):
    """
    Return the first valid federated-round count
    found in metadata.
    """

    for key in keys:

        value = metadata.get(
            key
        )

        if value is None:
            continue

        try:

            return int(
                value
            )

        except (
            TypeError,
            ValueError,
        ):

            continue

    return default


# ============================================================
# CLINICAL GUIDELINE VALIDATION
# ============================================================

def validate_clinical_guidelines():

    print()
    print("=" * 60)
    print("CLINICAL GUIDELINE VALIDATION")
    print("=" * 60)

    validator = (
        ClinicalGuidelineValidator()
    )

    # ========================================================
    # DIABETES EXAMPLE
    # ========================================================

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

    diabetes_result = (
        validator.validate_diabetes(
            diabetes_patient,
            diabetes_prediction,
        )
    )

    # ========================================================
    # CARDIOVASCULAR EXAMPLE
    # ========================================================

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

    cardiovascular_result = (
        validator.validate_cardiovascular(
            cardiovascular_patient,
            cardiovascular_prediction,
        )
    )

    # ========================================================
    # RESULTS
    # ========================================================

    print(
        "Validator version:",
        validator.VERSION,
    )

    print(
        "Diabetes guideline validation:",
        diabetes_result["status"],
    )

    print(
        "Cardiovascular guideline validation:",
        cardiovascular_result["status"],
    )

    print(
        "Diabetes clinical alerts:",
        diabetes_result["alertCount"],
    )

    print(
        "Cardiovascular clinical alerts:",
        cardiovascular_result["alertCount"],
    )

    diabetes_passed = (
        diabetes_result["status"]
        == "PASS"
    )

    cardiovascular_passed = (
        cardiovascular_result["status"]
        == "PASS"
    )

    overall_passed = (
        diabetes_passed
        and
        cardiovascular_passed
    )

    overall_status = (
        "PASS"
        if overall_passed
        else "REVIEW_REQUIRED"
    )

    print(
        "Clinical guideline compliance:",
        overall_status,
    )

    print(
        "Clinical guideline validation uses "
        "transparent rule-based checks."
    )

    print(
        "This component is for educational and "
        "clinical decision-support validation only."
    )

    return {
        "status": overall_status,
        "diabetes": diabetes_result,
        "cardiovascular": cardiovascular_result,
    }


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 60)
    print("MediSphere Milestone 2 Validation")
    print("=" * 60)

    print()

    print(
        "Validation timestamp:",
        datetime.now(
            timezone.utc
        ).isoformat(),
    )

    print()

    print(
        "IMPORTANT: Existing saved models "
        "are being validated."
    )

    print(
        "No model retraining is performed."
    )

    # ========================================================
    # MODEL VALIDATION
    # ========================================================

    cvd_result = (
        validate_cardiovascular_model()
    )

    diabetes_result = (
        validate_diabetes_model()
    )

    # ========================================================
    # FEDERATED VALIDATION
    # ========================================================

    federated_result = (
        validate_federated_training()
    )

    # ========================================================
    # CLINICAL VALIDATION
    # ========================================================

    clinical_result = (
        validate_clinical_guidelines()
    )

    # ========================================================
    # FINAL SUMMARY
    # ========================================================

    print()
    print("=" * 60)
    print("MILESTONE 2 VALIDATION SUMMARY")
    print("=" * 60)

    print(
        "CVD accuracy >90%:",
        cvd_result["accuracy_status"],
    )

    print(
        "Diabetes accuracy >90%:",
        diabetes_result["accuracy_status"],
    )

    print(
        "CVD calibration:",
        cvd_result["calibration_status"],
    )

    print(
        "Diabetes calibration:",
        diabetes_result["calibration_status"],
    )

    print(
        "CVD SHAP:",
        cvd_result["shap_status"],
    )

    print(
        "Diabetes SHAP:",
        diabetes_result["shap_status"],
    )

    print(
        "CVD federated convergence:",
        federated_result["cvd"],
    )

    print(
        "Diabetes federated convergence:",
        federated_result["diabetes"],
    )

    print(
        "Clinical guideline compliance:",
        clinical_result["status"],
    )

    print()

    print(
        "Validation complete."
    )

    print(
        "No saved model files were modified."
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()