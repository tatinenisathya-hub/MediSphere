import os
from pathlib import Path

import numpy as np
import pandas as pd


# ============================================================
# MediSphere Diabetes Synthetic Dataset v4
# ============================================================
#
# Educational synthetic dataset.
#
# The dataset intentionally uses the SAME 8 features as the
# existing MediSphere Diabetes model so that:
#
# React
#   -> Spring Boot
#   -> FastAPI
#   -> DiabetesPredictor
#
# does not require a feature-schema change.
#
# IMPORTANT:
# This dataset is synthetic and must NOT be presented as
# clinical ground truth.
# ============================================================


RANDOM_STATE = 42
NUMBER_OF_ROWS = 5000

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data"

OUTPUT_FILE = DATA_DIR / "diabetes_synthetic_v4.csv"


FEATURE_NAMES = [
    "pregnancies",
    "glucose",
    "bloodPressure",
    "skinThickness",
    "insulin",
    "bmi",
    "diabetesPedigree",
    "age",
]


TARGET_NAME = "outcome"


def generate_dataset(
    rows=NUMBER_OF_ROWS,
    seed=RANDOM_STATE,
):

    rng = np.random.default_rng(seed)

    # --------------------------------------------------------
    # Generate patient features
    # --------------------------------------------------------

    pregnancies = rng.integers(
        0,
        14,
        rows,
    )

    age = np.clip(
        rng.normal(
            43,
            13,
            rows,
        ),
        21,
        80,
    )

    bmi = np.clip(
        rng.normal(
            28.5,
            5.5,
            rows,
        ),
        18,
        45,
    )

    blood_pressure = np.clip(
        rng.normal(
            74
            + (age - 43) * 0.18
            + (bmi - 28) * 0.35,
            9,
            rows,
        ),
        50,
        115,
    )

    glucose = np.clip(
        rng.normal(
            105
            + (bmi - 28) * 1.8
            + (age - 43) * 0.35,
            27,
            rows,
        ),
        60,
        220,
    )

    skin_thickness = np.clip(
        rng.normal(
            27
            + (bmi - 28) * 0.7,
            8,
            rows,
        ),
        8,
        55,
    )

    insulin = np.clip(
        rng.normal(
            105
            + (glucose - 105) * 1.15
            + (bmi - 28) * 5,
            55,
            rows,
        ),
        15,
        400,
    )

    diabetes_pedigree = np.clip(
        rng.lognormal(
            mean=-0.75,
            sigma=0.45,
            size=rows,
        ),
        0.05,
        2.0,
    )

    # --------------------------------------------------------
    # Standardized latent risk factors
    # --------------------------------------------------------

    glucose_z = (
        glucose - 115
    ) / 25.0

    bmi_z = (
        bmi - 28
    ) / 5.0

    age_z = (
        age - 43
    ) / 13.0

    bp_z = (
        blood_pressure - 75
    ) / 10.0

    pregnancy_z = (
        pregnancies - 3
    ) / 3.0

    pedigree_z = (
        diabetes_pedigree - 0.5
    ) / 0.35

    insulin_z = (
        insulin - 110
    ) / 70.0

    # --------------------------------------------------------
    # Synthetic diabetes risk function
    # --------------------------------------------------------
    #
    # The target is generated from meaningful combinations
    # of the SAME features used by the MediSphere UI.
    #
    # This is intentionally learnable for demonstration and
    # validation purposes.
    # --------------------------------------------------------

    interaction_glucose_bmi = (
        glucose_z * bmi_z
    )

    interaction_glucose_age = (
        glucose_z * age_z
    )

    risk_score = (
        1.65 * glucose_z
        + 0.65 * bmi_z
        + 0.55 * age_z
        + 0.35 * bp_z
        + 0.25 * pregnancy_z
        + 0.30 * pedigree_z
        + 0.15 * insulin_z
        + 0.45 * interaction_glucose_bmi
        + 0.25 * interaction_glucose_age
    )

    # --------------------------------------------------------
    # Convert latent risk into balanced binary target
    # --------------------------------------------------------
    #
    # Using the median threshold keeps the demonstration
    # dataset reasonably balanced while retaining a genuine
    # held-out evaluation.
    # --------------------------------------------------------

    threshold = np.median(
        risk_score
    )

    outcome = (
        risk_score >= threshold
    ).astype(int)

    dataframe = pd.DataFrame(
        {
            "pregnancies": pregnancies,
            "glucose": glucose,
            "bloodPressure": blood_pressure,
            "skinThickness": skin_thickness,
            "insulin": insulin,
            "bmi": bmi,
            "diabetesPedigree": diabetes_pedigree,
            "age": age,
            "outcome": outcome,
        }
    )

    # --------------------------------------------------------
    # Round values for realistic-looking stored data
    # --------------------------------------------------------

    dataframe["pregnancies"] = (
        dataframe["pregnancies"].astype(int)
    )

    dataframe["glucose"] = (
        dataframe["glucose"].round(1)
    )

    dataframe["bloodPressure"] = (
        dataframe["bloodPressure"].round(1)
    )

    dataframe["skinThickness"] = (
        dataframe["skinThickness"].round(1)
    )

    dataframe["insulin"] = (
        dataframe["insulin"].round(1)
    )

    dataframe["bmi"] = (
        dataframe["bmi"].round(2)
    )

    dataframe["diabetesPedigree"] = (
        dataframe["diabetesPedigree"].round(3)
    )

    dataframe["age"] = (
        dataframe["age"].round(1)
    )

    return dataframe


def main():

    print()
    print("=" * 70)
    print("MEDISPHERE DIABETES SYNTHETIC DATASET v4")
    print("=" * 70)

    DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    dataframe = generate_dataset()

    dataframe.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print()
    print("Dataset saved:")
    print(OUTPUT_FILE)

    print()
    print("Dataset shape:")
    print(dataframe.shape)

    print()
    print("Features:")
    for feature in FEATURE_NAMES:
        print(" -", feature)

    print()
    print("Target distribution:")
    print(
        dataframe[TARGET_NAME].value_counts()
        .sort_index()
    )

    print()
    print("Target percentages:")
    print(
        dataframe[TARGET_NAME]
        .value_counts(
            normalize=True
        )
        .sort_index()
        .round(4)
    )

    print()
    print("First five records:")
    print(
        dataframe.head()
    )

    print()
    print("=" * 70)
    print("SYNTHETIC DATASET GENERATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()