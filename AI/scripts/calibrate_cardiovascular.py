"""
Post-hoc probability calibration for the MediSphere
Cardiovascular Risk Model.

IMPORTANT:
- The existing CVD neural network is NOT retrained.
- The existing 480-sample test set is NOT used for fitting.
- An independent synthetic calibration dataset is generated
  using a different random seed.
- The calibrator is evaluated on the existing held-out test set.

This is an educational calibration workflow for MediSphere.
It is NOT a clinical validation procedure.
"""

from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf

from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    brier_score_loss,
)


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_FILE = (
    PROJECT_ROOT
    / "AI"
    / "data"
    / "raw"
    / "cardiovascular_synthetic.csv"
)

MODEL_FILE = (
    PROJECT_ROOT
    / "AI"
    / "saved_models"
    / "cardiovascular_federated.weights.h5"
)

SCALER_FILE = (
    PROJECT_ROOT
    / "AI"
    / "saved_models"
    / "cardiovascular_scaler.joblib"
)

METADATA_FILE = (
    PROJECT_ROOT
    / "AI"
    / "saved_models"
    / "cardiovascular_metadata.json"
)

CALIBRATOR_FILE = (
    PROJECT_ROOT
    / "AI"
    / "saved_models"
    / "cardiovascular_calibrator.joblib"
)


# ============================================================
# CONFIGURATION
# ============================================================

CALIBRATION_SEED = 20260914

CALIBRATION_ROWS = 1200

TEST_SIZE = 0.20

FEATURES = [
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

TARGET = "cvd_target"


# ============================================================
# MODEL ARCHITECTURE
# ============================================================

def build_model():
    """
    Recreate the exact MediSphere CVD v2 architecture.

    13
      -> Dense 64 ReLU
      -> Dropout 0.10
      -> Dense 32 ReLU
      -> Dropout 0.10
      -> Dense 16 ReLU
      -> Dense 1 Sigmoid
    """

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(
                shape=(len(FEATURES),)
            ),

            tf.keras.layers.Dense(
                64,
                activation="relu",
            ),

            tf.keras.layers.Dropout(
                0.10
            ),

            tf.keras.layers.Dense(
                32,
                activation="relu",
            ),

            tf.keras.layers.Dropout(
                0.10
            ),

            tf.keras.layers.Dense(
                16,
                activation="relu",
            ),

            tf.keras.layers.Dense(
                1,
                activation="sigmoid",
            ),
        ]
    )

    return model


# ============================================================
# SYNTHETIC DATA GENERATION
# ============================================================

def generate_calibration_dataset(
    rows=CALIBRATION_ROWS,
    seed=CALIBRATION_SEED,
):
    """
    Generate an independent synthetic calibration dataset
    using the same data-generating process as the CVD training
    dataset but with a different random seed.

    This dataset is NOT written over the training dataset.
    """

    rng = np.random.default_rng(seed)

    age = rng.integers(
        25,
        86,
        rows,
    )

    sex = rng.integers(
        0,
        2,
        rows,
    )

    trestbps = np.clip(
        rng.normal(
            124 + (age - 50) * 0.42,
            16,
            rows,
        ),
        85,
        210,
    )

    chol = np.clip(
        rng.normal(
            188 + (age - 50) * 0.20,
            32,
            rows,
        ),
        100,
        360,
    )

    thalach = np.clip(
        rng.normal(
            150 - (age - 50) * 0.55,
            18,
            rows,
        ),
        70,
        210,
    )

    oldpeak = np.clip(
        rng.normal(
            0.9,
            1.0,
            rows,
        ),
        0,
        6,
    )

    cp = rng.integers(
        1,
        5,
        rows,
    )

    fbs = rng.binomial(
        1,
        0.15,
        rows,
    )

    restecg = rng.integers(
        0,
        3,
        rows,
    )

    exang = rng.binomial(
        1,
        0.25,
        rows,
    )

    slope = rng.integers(
        1,
        4,
        rows,
    )

    ca = rng.choice(
        [0, 1, 2, 3],
        size=rows,
        p=[
            0.58,
            0.25,
            0.12,
            0.05,
        ],
    )

    thal = rng.choice(
        [3, 6, 7],
        size=rows,
        p=[
            0.55,
            0.15,
            0.30,
        ],
    )

    risk_score = (
        0.075 * (age - 50)
        + 0.028 * (trestbps - 120)
        + 0.014 * (chol - 180)
        + 0.70 * sex
        + 1.10 * (cp == 4)
        + 0.50 * (cp == 3)
        + 0.30 * fbs
        + 0.20 * restecg
        - 0.025 * (thalach - 140)
        + 1.00 * exang
        + 0.50 * oldpeak
        + 0.30 * (slope == 2)
        + 0.55 * (slope == 3)
        + 1.00 * ca
        + 0.90 * (thal == 7)
        + 0.35 * (thal == 6)
        + rng.normal(
            0,
            0.20,
            rows,
        )
    )

    cvd_target = (
        risk_score >= 4.0
    ).astype(int)

    return pd.DataFrame(
        {
            "age": age,
            "sex": sex,
            "cp": cp,
            "trestbps": trestbps,
            "chol": chol,
            "fbs": fbs,
            "restecg": restecg,
            "thalach": thalach,
            "exang": exang,
            "oldpeak": oldpeak,
            "slope": slope,
            "ca": ca,
            "thal": thal,
            "cvd_target": cvd_target,
        }
    )


# ============================================================
# ECE
# ============================================================

def expected_calibration_error(
    y_true,
    probabilities,
    bins=10,
):
    """
    Calculate Expected Calibration Error.

    ECE is the weighted difference between:
      - average predicted probability
      - actual positive frequency

    Requirement:
        ECE <= 0.10
    """

    y_true = np.asarray(
        y_true,
        dtype=np.float64,
    )

    probabilities = np.asarray(
        probabilities,
        dtype=np.float64,
    )

    probabilities = np.clip(
        probabilities,
        0.0,
        1.0,
    )

    edges = np.linspace(
        0.0,
        1.0,
        bins + 1,
    )

    ece = 0.0

    for index in range(bins):

        lower = edges[index]
        upper = edges[index + 1]

        if index == bins - 1:
            mask = (
                (probabilities >= lower)
                & (probabilities <= upper)
            )
        else:
            mask = (
                (probabilities >= lower)
                & (probabilities < upper)
            )

        if not np.any(mask):
            continue

        confidence = probabilities[mask].mean()
        accuracy = y_true[mask].mean()

        weight = mask.mean()

        ece += weight * abs(
            confidence - accuracy
        )

    return float(ece)


# ============================================================
# SAFE LOGIT
# ============================================================

def probability_to_logit(probabilities):
    probabilities = np.asarray(
        probabilities,
        dtype=np.float64,
    )

    probabilities = np.clip(
        probabilities,
        1e-7,
        1.0 - 1e-7,
    )

    return np.log(
        probabilities
        / (1.0 - probabilities)
    )


# ============================================================
# CALIBRATOR
# ============================================================

def fit_platt_calibrator(
    probabilities,
    y_true,
):
    """
    Platt scaling.

    Learns:

        calibrated_probability =
            sigmoid(
                coefficient * logit(raw_probability)
                + intercept
            )

    LogisticRegression is used only as a calibration layer.
    """

    logits = probability_to_logit(
        probabilities
    ).reshape(-1, 1)

    calibrator = LogisticRegression(
        solver="lbfgs",
        random_state=42,
        max_iter=1000,
    )

    calibrator.fit(
        logits,
        y_true,
    )

    return calibrator


# ============================================================
# APPLY CALIBRATOR
# ============================================================

def calibrate_probabilities(
    calibrator,
    probabilities,
):
    logits = probability_to_logit(
        probabilities
    ).reshape(-1, 1)

    calibrated = calibrator.predict_proba(
        logits
    )[:, 1]

    return np.clip(
        calibrated,
        0.0,
        1.0,
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("MediSphere CVD Post-Hoc Calibration")
    print("=" * 70)

    # --------------------------------------------------------
    # Check required artifacts
    # --------------------------------------------------------

    required_files = [
        MODEL_FILE,
        SCALER_FILE,
        METADATA_FILE,
        DATA_FILE,
    ]

    for file in required_files:

        if not file.exists():

            raise FileNotFoundError(
                f"Required file not found: {file}"
            )

    # --------------------------------------------------------
    # Load metadata
    # --------------------------------------------------------

    with open(
        METADATA_FILE,
        "r",
        encoding="utf-8",
    ) as file:

        metadata = json.load(file)

    print(
        f"Existing model version: "
        f"{metadata.get('modelVersion', 'UNKNOWN')}"
    )

    print(
        f"Existing model accuracy: "
        f"{metadata.get('accuracy', 'UNKNOWN')}"
    )

    print(
        f"Existing model ECE: "
        f"{metadata.get('ece', 'UNKNOWN')}"
    )

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    print()
    print("Loading CVD neural network...")

    model = build_model()

    # Build the model before loading weights.
    model.build(
        (None, len(FEATURES))
    )

    model.load_weights(
        MODEL_FILE
    )

    print("CVD model loaded successfully.")

    # --------------------------------------------------------
    # Load existing scaler
    # --------------------------------------------------------

    scaler = joblib.load(
        SCALER_FILE
    )

    # --------------------------------------------------------
    # Generate independent calibration data
    # --------------------------------------------------------

    print()
    print(
        "Generating independent calibration dataset..."
    )

    calibration_df = (
        generate_calibration_dataset()
    )

    X_calibration = (
        calibration_df[
            FEATURES
        ]
        .astype(np.float32)
        .values
    )

    y_calibration = (
        calibration_df[TARGET]
        .astype(np.int32)
        .values
    )

    print(
        f"Calibration samples: "
        f"{len(calibration_df)}"
    )

    print(
        f"Calibration positives: "
        f"{int(y_calibration.sum())}"
    )

    print(
        f"Calibration negatives: "
        f"{int((y_calibration == 0).sum())}"
    )

    # --------------------------------------------------------
    # Scale calibration data using the EXISTING training scaler
    # --------------------------------------------------------

    X_calibration_scaled = (
        scaler.transform(
            X_calibration
        ).astype(np.float32)
    )

    # --------------------------------------------------------
    # Raw model predictions
    # --------------------------------------------------------

    raw_calibration_probabilities = (
        model.predict(
            X_calibration_scaled,
            verbose=0,
        )
        .reshape(-1)
    )

    raw_calibration_probabilities = np.clip(
        raw_calibration_probabilities,
        0.0,
        1.0,
    )

    raw_calibration_ece = (
        expected_calibration_error(
            y_calibration,
            raw_calibration_probabilities,
        )
    )

    raw_calibration_brier = (
        brier_score_loss(
            y_calibration,
            raw_calibration_probabilities,
        )
    )

    print()
    print("Independent calibration-set performance")
    print(
        f"Raw ECE:   {raw_calibration_ece:.4f}"
    )
    print(
        f"Raw Brier: {raw_calibration_brier:.4f}"
    )

    # --------------------------------------------------------
    # Fit Platt scaling
    # --------------------------------------------------------

    print()
    print("Fitting Platt scaling calibrator...")

    calibrator = fit_platt_calibrator(
        raw_calibration_probabilities,
        y_calibration,
    )

    calibrated_calibration_probabilities = (
        calibrate_probabilities(
            calibrator,
            raw_calibration_probabilities,
        )
    )

    calibrated_calibration_ece = (
        expected_calibration_error(
            y_calibration,
            calibrated_calibration_probabilities,
        )
    )

    calibrated_calibration_brier = (
        brier_score_loss(
            y_calibration,
            calibrated_calibration_probabilities,
        )
    )

    print(
        f"Calibrated ECE:   "
        f"{calibrated_calibration_ece:.4f}"
    )

    print(
        f"Calibrated Brier: "
        f"{calibrated_calibration_brier:.4f}"
    )

    print()
    print(
        "Platt coefficient: "
        f"{float(calibrator.coef_[0][0]):.6f}"
    )

    print(
        "Platt intercept:   "
        f"{float(calibrator.intercept_[0]):.6f}"
    )

    # --------------------------------------------------------
    # Verify calibrator does not destroy classification behavior
    # --------------------------------------------------------

    raw_predictions = (
        raw_calibration_probabilities >= 0.5
    ).astype(int)

    calibrated_predictions = (
        calibrated_calibration_probabilities >= 0.5
    ).astype(int)

    raw_accuracy = accuracy_score(
        y_calibration,
        raw_predictions,
    )

    calibrated_accuracy = accuracy_score(
        y_calibration,
        calibrated_predictions,
    )

    raw_auc = roc_auc_score(
        y_calibration,
        raw_calibration_probabilities,
    )

    calibrated_auc = roc_auc_score(
        y_calibration,
        calibrated_calibration_probabilities,
    )

    print()
    print("Calibration-set classification comparison")
    print(
        f"Raw accuracy:        {raw_accuracy:.4f}"
    )
    print(
        f"Calibrated accuracy:  {calibrated_accuracy:.4f}"
    )
    print(
        f"Raw ROC-AUC:          {raw_auc:.4f}"
    )
    print(
        f"Calibrated ROC-AUC:   {calibrated_auc:.4f}"
    )

    # --------------------------------------------------------
    # Save calibrator
    # --------------------------------------------------------

    calibration_artifact = {
        "method": "platt_scaling",
        "model": "cardiovascular_risk",
        "base_model_version": metadata.get(
            "modelVersion",
            "UNKNOWN",
        ),
        "calibration_seed": CALIBRATION_SEED,
        "calibration_samples": CALIBRATION_ROWS,
        "feature_count": len(FEATURES),
        "features": FEATURES,
        "coefficient": float(
            calibrator.coef_[0][0]
        ),
        "intercept": float(
            calibrator.intercept_[0]
        ),
        "calibration_ece_before": float(
            raw_calibration_ece
        ),
        "calibration_ece_after": float(
            calibrated_calibration_ece
        ),
        "calibration_brier_before": float(
            raw_calibration_brier
        ),
        "calibration_brier_after": float(
            calibrated_calibration_brier
        ),
        "purpose":
            "Post-hoc probability calibration "
            "for educational risk prediction",
    }

    joblib.dump(
        calibration_artifact,
        CALIBRATOR_FILE,
    )

    print()
    print(
        f"Calibrator saved to:\n"
        f"{CALIBRATOR_FILE}"
    )

    # --------------------------------------------------------
    # Print final instructions
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("Calibration artifact created successfully.")
    print("=" * 70)

    print(
        "IMPORTANT:"
    )

    print(
        "The existing CVD neural-network weights "
        "were NOT modified."
    )

    print(
        "The existing 480-sample test set "
        "was NOT used for calibrator fitting."
    )

    print(
        "Next step: update cardiovascular_predictor.py "
        "to apply this calibrator to prediction probabilities."
    )

    print("=" * 70)


if __name__ == "__main__":
    main()