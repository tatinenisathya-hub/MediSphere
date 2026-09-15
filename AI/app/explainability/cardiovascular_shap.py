from typing import Dict, List

import numpy as np
import shap
import tensorflow as tf


from app.config import CARDIOVASCULAR_FEATURES
from app.models.cardiovascular import (
    build_cardiovascular_model,
)


class CardiovascularShapExplainer:
    """
    SHAP explainability service for the MediSphere
    cardiovascular risk model.

    The explainer receives already-scaled clinical
    features and explains the model's output using SHAP.
    """

    def __init__(
        self,
        model: tf.keras.Model,
        background_data: np.ndarray,
    ):
        self.model = model

        self.background_data = (
            background_data.astype(
                np.float32
            )
        )

        self.explainer = shap.Explainer(
            self._predict,
            self.background_data,
        )

    def _predict(
        self,
        features: np.ndarray,
    ) -> np.ndarray:
        """
        Generate model probabilities for SHAP.

        SHAP passes a NumPy array into this method.
        """

        features = np.asarray(
            features,
            dtype=np.float32,
        )

        predictions = (
            self.model
            .predict(
                features,
                verbose=0,
            )
            .reshape(-1)
        )

        return predictions

    def explain(
        self,
        features: np.ndarray,
    ) -> Dict:
        """
        Generate a SHAP explanation for one patient
        feature vector.

        Returns:

            prediction
            base_value
            feature contributions
            positive contributors
            negative contributors
        """

        features = np.asarray(
            features,
            dtype=np.float32,
        )

        if features.ndim == 1:
            features = features.reshape(
                1,
                -1,
            )

        if features.shape[1] != len(
            CARDIOVASCULAR_FEATURES
        ):
            raise ValueError(
                "Expected "
                f"{len(CARDIOVASCULAR_FEATURES)} "
                "features, but received "
                f"{features.shape[1]}."
            )

        shap_values = self.explainer(
            features
        )

        prediction = float(
            self.model
            .predict(
                features,
                verbose=0,
            )[0][0]
        )

        values = np.asarray(
            shap_values.values
        )

        if values.ndim == 3:
            values = values[0, :, 0]

        elif values.ndim == 2:
            values = values[0]

        else:
            values = values.reshape(-1)

        base_values = np.asarray(
            shap_values.base_values
        )

        if base_values.size > 1:
            base_value = float(
                base_values.reshape(-1)[0]
            )
        else:
            base_value = float(
                base_values.reshape(-1)[0]
            )

        contributions: List[Dict] = []

        for index, feature_name in enumerate(
            CARDIOVASCULAR_FEATURES
        ):
            contribution = float(
                values[index]
            )

            contributions.append(
                {
                    "feature": feature_name,
                    "shapValue": contribution,
                    "direction": (
                        "increases_risk"
                        if contribution > 0
                        else "decreases_risk"
                    ),
                }
            )

        contributions.sort(
            key=lambda item: abs(
                item["shapValue"]
            ),
            reverse=True,
        )

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

        return {
            "prediction": prediction,

            "baseValue": base_value,

            "featureContributions": (
                contributions
            ),

            "positiveContributors": (
                positive_contributors
            ),

            "negativeContributors": (
                negative_contributors
            ),
        }


def create_cardiovascular_explainer(
    background_data: np.ndarray,
) -> CardiovascularShapExplainer:
    """
    Create a SHAP explainer using the trained
    cardiovascular federated global model.
    """

    model = (
        build_cardiovascular_model()
    )

    return CardiovascularShapExplainer(
        model=model,
        background_data=background_data,
    )