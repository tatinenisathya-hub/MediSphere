import json
import os

import joblib
import numpy as np
import pandas as pd
import shap
import tensorflow as tf


# ============================================================
# MediSphere - Diabetes Risk SHAP Test
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "saved_models"
)

MODEL_FILE = os.path.join(
    MODEL_DIR,
    "diabetes_federated.weights.h5"
)

SCALER_FILE = os.path.join(
    MODEL_DIR,
    "diabetes_scaler.joblib"
)

METADATA_FILE = os.path.join(
    MODEL_DIR,
    "diabetes_metadata.json"
)

DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "raw",
    "pima-indians-diabetes.data.csv"
)


# ============================================================
# Diabetes feature names
# ============================================================

FEATURE_NAMES = [
    "pregnancies",
    "glucose",
    "bloodpressure",
    "skinthickness",
    "insulin",
    "bmi",
    "diabetespedigreefunction",
    "age"
]


# ============================================================
# IMPORTANT:
# This architecture must match the architecture used during
# federated diabetes training.
#
# The saved weights show the first Dense layer has:
#
#     input = 8
#     output = 32
#
# ============================================================

def create_model():

    model = tf.keras.Sequential([
        tf.keras.layers.Input(
            shape=(8,)
        ),

        tf.keras.layers.Dense(
            32,
            activation="relu"
        ),

        tf.keras.layers.Dense(
            16,
            activation="relu"
        ),

        tf.keras.layers.Dense(
            1,
            activation="sigmoid"
        )
    ])

    return model


# ============================================================
# Global model
# ============================================================

model = None


# ============================================================
# Prediction function used by SHAP
# ============================================================

def predict_probability(x):

    predictions = model(
        tf.convert_to_tensor(
            x,
            dtype=tf.float32
        ),
        training=False
    )

    return predictions.numpy().reshape(-1)


# ============================================================
# Main
# ============================================================

print()
print("==========================================")
print("MediSphere Diabetes SHAP Test")
print("==========================================")
print()


# ============================================================
# Check model files
# ============================================================

if not os.path.exists(MODEL_FILE):

    raise FileNotFoundError(
        f"Diabetes model not found:\n{MODEL_FILE}"
    )


if not os.path.exists(SCALER_FILE):

    raise FileNotFoundError(
        f"Diabetes scaler not found:\n{SCALER_FILE}"
    )


# ============================================================
# Load metadata
# ============================================================

metadata = {}

if os.path.exists(METADATA_FILE):

    with open(
        METADATA_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        metadata = json.load(file)


# ============================================================
# Load scaler
# ============================================================

print("Loading diabetes scaler...")

scaler = joblib.load(
    SCALER_FILE
)

print("Scaler loaded.")


# ============================================================
# Create model
# ============================================================

print("Creating diabetes model...")

model = create_model()

# Build model variables.
model.build(
    input_shape=(None, 8)
)


# ============================================================
# Load federated global weights
# ============================================================

print("Loading federated global weights...")

model.load_weights(
    MODEL_FILE
)

print("Federated global diabetes model loaded successfully.")


# ============================================================
# Display model architecture
# ============================================================

print()
print("Model architecture:")
model.summary()


# ============================================================
# Load background data
# ============================================================

print()
print("Preparing SHAP background data...")


if os.path.exists(DATA_FILE):

    print("Loading Pima diabetes dataset...")

    df = pd.read_csv(
        DATA_FILE,
        header=None
    )

    df.columns = (
        FEATURE_NAMES +
        ["outcome"]
    )

    background_raw = df[
        FEATURE_NAMES
    ].copy()

    # --------------------------------------------------------
    # Replace impossible zero values for physiological fields
    # --------------------------------------------------------

    zero_replace_columns = [
        "glucose",
        "bloodpressure",
        "skinthickness",
        "insulin",
        "bmi"
    ]

    for column in zero_replace_columns:

        valid_values = background_raw[
            background_raw[column] != 0
        ][column]

        if len(valid_values) > 0:

            median_value = valid_values.median()

            background_raw[column] = (
                background_raw[column]
                .replace(
                    0,
                    median_value
                )
            )

    # Keep background small for CPU performance.
    background_raw = background_raw.iloc[
        :50
    ]

else:

    print(
        "Pima dataset not found."
    )

    print(
        "Using representative SHAP background."
    )

    background_raw = pd.DataFrame(
        [
            [
                2,
                120,
                70,
                20,
                79,
                32.0,
                0.45,
                33
            ],
            [
                4,
                140,
                78,
                25,
                100,
                35.0,
                0.55,
                40
            ],
            [
                1,
                105,
                68,
                18,
                70,
                28.5,
                0.30,
                29
            ],
            [
                6,
                160,
                82,
                30,
                120,
                38.0,
                0.70,
                48
            ],
            [
                3,
                130,
                75,
                22,
                90,
                31.5,
                0.50,
                36
            ]
        ],
        columns=FEATURE_NAMES
    )


# ============================================================
# Scale SHAP background
# ============================================================

background = scaler.transform(
    background_raw
)


print(
    f"SHAP background records: "
    f"{len(background)}"
)


# ============================================================
# Test patient
# ============================================================
#
# This is a benchmark/test input.
# It is NOT a real patient record.
#
# ============================================================

test_patient_raw = pd.DataFrame(
    [
        {
            "pregnancies": 6,
            "glucose": 148,
            "bloodpressure": 72,
            "skinthickness": 35,
            "insulin": 0,
            "bmi": 33.6,
            "diabetespedigreefunction": 0.627,
            "age": 50
        }
    ],
    columns=FEATURE_NAMES
)


# ============================================================
# Process test input
# ============================================================

test_patient_processed = (
    test_patient_raw.copy()
)


# Replace zero insulin with the median of available
# background insulin values.

if (
    test_patient_processed.loc[
        0,
        "insulin"
    ] == 0
):

    valid_insulin = background_raw[
        background_raw["insulin"] != 0
    ]["insulin"]

    if len(valid_insulin) > 0:

        test_patient_processed.loc[
            0,
            "insulin"
        ] = valid_insulin.median()


# ============================================================
# Scale test patient
# ============================================================

test_patient = scaler.transform(
    test_patient_processed
)


# ============================================================
# Prediction
# ============================================================

print()
print("Running diabetes risk prediction...")

prediction = float(
    predict_probability(
        test_patient
    )[0]
)


print()
print(
    f"Diabetes risk probability: "
    f"{prediction:.6f}"
)


# ============================================================
# Risk band
# ============================================================

if prediction >= 0.70:

    risk_band = "HIGH"

elif prediction >= 0.40:

    risk_band = "MODERATE"

else:

    risk_band = "LOW"


print(
    f"Risk band: {risk_band}"
)


# ============================================================
# Create SHAP explainer
# ============================================================

print()
print("Creating SHAP explainer...")

explainer = shap.KernelExplainer(
    predict_probability,
    background
)

print("SHAP explainer created successfully.")


# ============================================================
# Calculate SHAP values
# ============================================================

print()
print("Calculating SHAP values...")
print("This may take a little time on CPU.")


shap_values = explainer.shap_values(
    test_patient,
    nsamples=100
)


# ============================================================
# Normalize SHAP output format
# ============================================================

if isinstance(
    shap_values,
    list
):

    shap_values = shap_values[0]


shap_values = np.asarray(
    shap_values
)


if shap_values.ndim == 3:

    shap_values = shap_values[0]


if shap_values.ndim == 2:

    shap_values = shap_values[0]


# ============================================================
# Validate SHAP shape
# ============================================================

if len(shap_values) != len(
    FEATURE_NAMES
):

    raise RuntimeError(
        "SHAP returned an unexpected number "
        "of feature contributions."
    )


# ============================================================
# Expected/base value
# ============================================================

expected_value = explainer.expected_value


if isinstance(
    expected_value,
    np.ndarray
):

    expected_value = float(
        expected_value.reshape(-1)[0]
    )

else:

    expected_value = float(
        expected_value
    )


print()
print(
    f"SHAP base value: "
    f"{expected_value:.6f}"
)


# ============================================================
# Build feature contributions
# ============================================================

contributions = []


for feature, value in zip(
    FEATURE_NAMES,
    shap_values
):

    value = float(value)

    if value > 0:

        direction = "increases_risk"

    elif value < 0:

        direction = "decreases_risk"

    else:

        direction = "neutral"

    contributions.append(
        {
            "feature": feature,
            "shapValue": value,
            "direction": direction
        }
    )


# ============================================================
# Sort by importance
# ============================================================

contributions.sort(
    key=lambda item: abs(
        item["shapValue"]
    ),
    reverse=True
)


# ============================================================
# Positive and negative contributors
# ============================================================

positive_contributors = [
    item
    for item in contributions
    if item["shapValue"] > 0
]


negative_contributors = [
    item
    for item in contributions
    if item["shapValue"] < 0
]


# ============================================================
# Display SHAP explanation
# ============================================================

print()
print("==========================================")
print("SHAP FEATURE CONTRIBUTIONS")
print("==========================================")

print()

for item in contributions:

    value = item["shapValue"]

    sign = (
        "+"
        if value >= 0
        else ""
    )

    print(
        f"{item['feature']:<30} "
        f"{sign}{value:.6f} "
        f"{item['direction']}"
    )


# ============================================================
# Validation
# ============================================================

if not np.isfinite(
    prediction
):

    raise RuntimeError(
        "Invalid diabetes probability."
    )


if not np.all(
    np.isfinite(shap_values)
):

    raise RuntimeError(
        "SHAP returned invalid values."
    )


# ============================================================
# Final result
# ============================================================

print()
print("==========================================")
print("DIABETES SHAP EXPLANATION TEST PASSED")
print("==========================================")

print()

print(
    f"Risk probability: "
    f"{prediction:.6f}"
)

print(
    f"Risk band: "
    f"{risk_band}"
)

print(
    f"Features explained: "
    f"{len(contributions)}"
)

print(
    f"Risk-increasing features: "
    f"{len(positive_contributors)}"
)

print(
    f"Risk-decreasing features: "
    f"{len(negative_contributors)}"
)

print()

print(
    "The federated diabetes model is "
    "successfully explainable using SHAP."
)

print()

print(
    "This output is for educational and "
    "clinical decision-support demonstration "
    "and is not a medical diagnosis."
)

print()