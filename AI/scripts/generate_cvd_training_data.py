"""
Generate a reproducible synthetic/de-identified cardiovascular
risk dataset for MediSphere federated model development.

IMPORTANT:
This dataset is synthetic and is intended for educational /
clinical decision-support demonstration only.

It is NOT a clinical dataset and must NOT be interpreted as
medical ground truth.
"""

from pathlib import Path

import numpy as np
import pandas as pd


SEED = 42
ROWS = 2400

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = PROJECT_ROOT / "AI" / "data" / "raw"

OUTPUT_FILE = OUTPUT_DIR / "cardiovascular_synthetic.csv"


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


def generate_dataset(
    rows: int = ROWS,
    seed: int = SEED,
) -> pd.DataFrame:

    rng = np.random.default_rng(seed)

    # ---------------------------------------------------------
    # Demographic features
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Cardiovascular measurements
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Categorical clinical features
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Synthetic cardiovascular risk score
    #
    # This is NOT a medical formula.
    # It creates reproducible relationships between features
    # and the synthetic target so that the ML model can learn
    # a meaningful demonstration task.
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Convert synthetic risk score into binary target.
    #
    # The threshold creates a sufficiently balanced learning
    # problem while retaining realistic feature relationships.
    # ---------------------------------------------------------

    cvd_target = (
        risk_score >= 4.0
    ).astype(int)

    frame = pd.DataFrame(
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

    return frame


def create_partitions():

    OUTPUT_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    data = generate_dataset()

    # ---------------------------------------------------------
    # Save complete synthetic dataset
    # ---------------------------------------------------------

    data.to_csv(
        OUTPUT_FILE,
        index=False,
    )

    print("=" * 60)
    print("MediSphere Synthetic CVD Dataset")
    print("=" * 60)

    print(
        f"Dataset saved to: {OUTPUT_FILE}"
    )

    print(
        f"Total records: {len(data)}"
    )

    print(
        f"Positive cases: {int(data['cvd_target'].sum())}"
    )

    print(
        f"Negative cases: "
        f"{int((data['cvd_target'] == 0).sum())}"
    )

    print(
        f"Positive rate: "
        f"{data['cvd_target'].mean():.4f}"
    )

    # ---------------------------------------------------------
    # Shuffle before hospital partitioning
    # ---------------------------------------------------------

    shuffled = data.sample(
        frac=1.0,
        random_state=SEED,
    ).reset_index(drop=True)

    partitions = np.array_split(
        shuffled,
        3,
    )

    hospitals = [
        "hospital_a",
        "hospital_b",
        "hospital_c",
    ]

    for hospital, partition in zip(
        hospitals,
        partitions,
    ):

        output = (
            OUTPUT_DIR
            / f"{hospital}_cvd.csv"
        )

        partition.to_csv(
            output,
            index=False,
        )

        print(
            f"{hospital}: "
            f"{len(partition)} records"
        )

    print("=" * 60)
    print("Synthetic CVD dataset generation complete.")
    print("=" * 60)

    return data


if __name__ == "__main__":
    create_partitions()
