import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


# ---------------------------------------------------------
# Add AI directory to Python path
# ---------------------------------------------------------

AI_ROOT = Path(__file__).resolve().parents[1]

sys.path.insert(
    0,
    str(AI_ROOT),
)


# ---------------------------------------------------------
# MediSphere imports
# ---------------------------------------------------------

from app.config import (
    CARDIOVASCULAR_DATASET,
    CARDIOVASCULAR_FEATURES,
    CARDIOVASCULAR_SCALER,
    CARDIOVASCULAR_WEIGHTS,
)

from app.explainability.cardiovascular_shap import (
    CardiovascularShapExplainer,
)

from app.models.cardiovascular import (
    build_cardiovascular_model,
)


# ---------------------------------------------------------
# Load public UCI dataset
# ---------------------------------------------------------

def load_public_dataset():

    dataframe = pd.read_csv(
        CARDIOVASCULAR_DATASET,
        header=None,
        names=[
            *CARDIOVASCULAR_FEATURES,
            "target",
        ],
        na_values="?",
    )

    dataframe = dataframe.apply(
        pd.to_numeric,
        errors="coerce",
    )

    dataframe = dataframe.dropna(
        subset=[
            *CARDIOVASCULAR_FEATURES,
            "target",
        ]
    )

    return dataframe


# ---------------------------------------------------------
# Main SHAP test
# ---------------------------------------------------------

def main():

    print()
    print(
        "=========================================="
    )

    print(
        "MediSphere Cardiovascular SHAP Test"
    )

    print(
        "=========================================="
    )

    # -----------------------------------------------------
    # Load scaler
    # -----------------------------------------------------

    scaler = joblib.load(
        CARDIOVASCULAR_SCALER
    )

    print(
        "Scaler loaded."
    )

    # -----------------------------------------------------
    # Load trained federated model
    # -----------------------------------------------------

    model = (
        build_cardiovascular_model()
    )

    model.load_weights(
        CARDIOVASCULAR_WEIGHTS
    )

    print(
        "Federated global model loaded."
    )

    # -----------------------------------------------------
    # Load public dataset
    # -----------------------------------------------------

    dataframe = load_public_dataset()

    features = dataframe[
        CARDIOVASCULAR_FEATURES
    ].to_numpy(
        dtype=np.float32
    )

    scaled_features = (
        scaler.transform(features)
        .astype(np.float32)
    )

    # Use a small background sample.
    #
    # This is only for testing SHAP.
    # It is not MediSphere patient data.
    background_size = min(
        40,
        len(scaled_features),
    )

    background_data = (
        scaled_features[
            :background_size
        ]
    )

    # -----------------------------------------------------
    # Create SHAP explainer
    # -----------------------------------------------------

    explainer = (
        CardiovascularShapExplainer(
            model=model,
            background_data=background_data,
        )
    )

    print(
        "SHAP explainer created."
    )

    # -----------------------------------------------------
    # Explain one public test record
    # -----------------------------------------------------

    sample = (
        scaled_features[
            0:1
        ]
    )

    result = (
        explainer.explain(
            sample
        )
    )

    # -----------------------------------------------------
    # Display prediction
    # -----------------------------------------------------

    prediction = result[
        "prediction"
    ]

    print()
    print(
        "Model probability:"
    )

    print(
        f"{prediction:.6f}"
    )

    print()
    print(
        "SHAP base value:"
    )

    print(
        f"{result['baseValue']:.6f}"
    )

    # -----------------------------------------------------
    # Display feature contributions
    # -----------------------------------------------------

    print()
    print(
        "Feature contributions:"
    )

    print(
        "------------------------------------------"
    )

    for item in result[
        "featureContributions"
    ]:

        print(
            f"{item['feature']:12s} "
            f"{item['shapValue']:+.6f} "
            f"{item['direction']}"
        )

    print()
    print(
        "=========================================="
    )

    print(
        "SHAP EXPLANATION TEST PASSED"
    )

    print(
        "=========================================="
    )


if __name__ == "__main__":
    main()