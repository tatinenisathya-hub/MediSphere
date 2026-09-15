from typing import Dict

import json
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
import shap

from app.config import (
    CARDIOVASCULAR_DATASET,
    CARDIOVASCULAR_FEATURES,
    CARDIOVASCULAR_SCALER,
    CARDIOVASCULAR_WEIGHTS,
    CARDIOVASCULAR_CALIBRATOR,
)


class CardiovascularPredictor:
    """
    Cardiovascular risk prediction service for MediSphere.

    Loads:
    - trained TensorFlow model weights
    - feature scaler
    - probability calibrator
    - model metadata
    - cardiovascular background dataset

    Provides:
    - cardiovascular risk prediction
    - SHAP-based explainability
    - model status information

    Model architecture used by CVD v2.0.0:

        13 input features
            ↓
        Dense(64, ReLU)
            ↓
        Dropout(0.10)
            ↓
        Dense(32, ReLU)
            ↓
        Dropout(0.10)
            ↓
        Dense(16, ReLU)
            ↓
        Dense(1, Sigmoid)

    Probability calibration:

        Raw neural-network probability
            ↓
        Platt scaling
            ↓
        Calibrated probability
    """

    # =============================================================
    # INITIALIZATION
    # =============================================================

    def __init__(self):

        print(
            "Initializing CardiovascularPredictor..."
        )

        # ---------------------------------------------------------
        # Feature names
        # ---------------------------------------------------------

        self.features = CARDIOVASCULAR_FEATURES

        # ---------------------------------------------------------
        # Load scaler
        # ---------------------------------------------------------

        print(
            "Loading cardiovascular scaler..."
        )

        self.scaler = joblib.load(
            CARDIOVASCULAR_SCALER
        )

        print(
            "Cardiovascular scaler loaded successfully."
        )

        # ---------------------------------------------------------
        # Build model
        # ---------------------------------------------------------

        self.model = self._build_model()

        # ---------------------------------------------------------
        # Load trained weights
        # ---------------------------------------------------------

        print(
            "Loading cardiovascular model weights..."
        )

        self.model.load_weights(
            CARDIOVASCULAR_WEIGHTS
        )

        print(
            "Cardiovascular model weights loaded successfully."
        )

        # ---------------------------------------------------------
        # Load probability calibrator
        # ---------------------------------------------------------

        print(
            "Loading cardiovascular probability calibrator..."
        )

        if not CARDIOVASCULAR_CALIBRATOR.exists():

            raise FileNotFoundError(
                "Cardiovascular probability calibrator "
                "not found at "
                f"{CARDIOVASCULAR_CALIBRATOR}"
            )

        self.calibrator = joblib.load(
            CARDIOVASCULAR_CALIBRATOR
        )

        # ---------------------------------------------------------
        # Validate calibrator artifact
        # ---------------------------------------------------------

        if not isinstance(
            self.calibrator,
            dict
        ):

            raise ValueError(
                "Invalid cardiovascular calibrator artifact. "
                "Expected a dictionary containing Platt "
                "scaling parameters."
            )

        if (
            "coefficient" not in self.calibrator
            or "intercept" not in self.calibrator
        ):

            raise ValueError(
                "Cardiovascular calibrator artifact is missing "
                "required Platt scaling parameters."
            )

        self.calibration_coefficient = float(
            self.calibrator["coefficient"]
        )

        self.calibration_intercept = float(
            self.calibrator["intercept"]
        )

        print(
            "Cardiovascular probability calibrator "
            "loaded successfully."
        )

        print(
            "Calibration method: "
            f"{self.calibrator.get('method', 'unknown')}"
        )

        # ---------------------------------------------------------
        # Load metadata
        # ---------------------------------------------------------

        self.metadata = self._load_metadata()

        # ---------------------------------------------------------
        # Load background data for SHAP
        # ---------------------------------------------------------

        self.background_data = (
            self._load_background_data()
        )

        # ---------------------------------------------------------
        # Create SHAP explainer
        # ---------------------------------------------------------

        self.shap_explainer = (
            self._create_shap_explainer()
        )

        print(
            "CardiovascularPredictor initialized successfully."
        )

    # =============================================================
    # MODEL STATUS
    # =============================================================

    def get_model_status(self) -> Dict:
        """
        Return information about the loaded cardiovascular
        federated model.
        """

        return {
            "modelType": self.metadata.get(
                "model",
                "cardiovascular_risk"
            ),

            "framework": self.metadata.get(
                "framework",
                "TensorFlow"
            ),

            "federatedFramework": self.metadata.get(
                "federated_framework",
                "TensorFlow Federated"
            ),

            "federatedAlgorithm": self.metadata.get(
                "federated_algorithm",
                "Weighted FedAvg"
            ),

            "clients": self.metadata.get(
                "number_of_clients",
                0
            ),

            "clientNames": self.metadata.get(
                "client_names",
                []
            ),

            "rounds": self.metadata.get(
                "number_of_rounds",
                0
            ),

            "features": self.metadata.get(
                "features",
                self.features
            ),

            "trainingSamples": self.metadata.get(
                "training_samples",
                0
            ),

            "testSamples": self.metadata.get(
                "test_samples",
                0
            ),

            "accuracy": self.metadata.get(
                "accuracy",
                0.0
            ),

            "rocAuc": self.metadata.get(
                "roc_auc",
                0.0
            ),

            "trainingDataset": self.metadata.get(
                "training_dataset",
                "cardiovascular_synthetic.csv"
            ),

            "targetDefinition": self.metadata.get(
                "target_definition",
                "0 = no cardiovascular risk; "
                "1 = presence of cardiovascular risk"
            ),

            "modelPurpose": self.metadata.get(
                "model_purpose",
                "Educational risk prediction and "
                "clinical decision-support demonstration"
            ),

            "calibration": {
                "enabled": True,
                "method": self.calibrator.get(
                    "method",
                    "platt_scaling"
                ),
                "artifact": (
                    "cardiovascular_calibrator.joblib"
                )
            },

            "status": "LOADED"
        }

    # =============================================================
    # BUILD MODEL
    # =============================================================

    def _build_model(self):
        """
        Build the exact neural-network architecture used during
        cardiovascular model training.
        """

        model = tf.keras.Sequential(
            [
                tf.keras.layers.Input(
                    shape=(len(self.features),)
                ),

                tf.keras.layers.Dense(
                    64,
                    activation="relu"
                ),

                tf.keras.layers.Dropout(
                    0.10
                ),

                tf.keras.layers.Dense(
                    32,
                    activation="relu"
                ),

                tf.keras.layers.Dropout(
                    0.10
                ),

                tf.keras.layers.Dense(
                    16,
                    activation="relu"
                ),

                tf.keras.layers.Dense(
                    1,
                    activation="sigmoid"
                ),
            ]
        )

        return model

    # =============================================================
    # LOAD METADATA
    # =============================================================

    def _load_metadata(self):
        """
        Load cardiovascular model metadata from JSON.
        """

        try:

            metadata_path = (
                CARDIOVASCULAR_WEIGHTS.parent
                / "cardiovascular_metadata.json"
            )

            if not metadata_path.exists():

                print(
                    "Warning: Cardiovascular metadata file "
                    "not found."
                )

                return {}

            with open(
                metadata_path,
                "r",
                encoding="utf-8"
            ) as file:

                metadata = json.load(
                    file
                )

            return metadata

        except Exception as exception:

            print(
                "Warning: Unable to load cardiovascular "
                f"model metadata: {exception}"
            )

            return {}

    # =============================================================
    # LOAD BACKGROUND DATA FOR SHAP
    # =============================================================

    def _load_background_data(self):
        """
        Load background records for SHAP.
        """

        try:

            print(
                "Loading cardiovascular background data for SHAP..."
            )

            dataframe = pd.read_csv(
                CARDIOVASCULAR_DATASET
            )

            print(
                "Cardiovascular dataset loaded successfully. "
                f"Shape: {dataframe.shape}"
            )

            missing_features = [
                feature
                for feature in self.features
                if feature not in dataframe.columns
            ]

            if missing_features:

                raise ValueError(
                    "Cardiovascular background dataset is "
                    "missing required features: "
                    + ", ".join(
                        missing_features
                    )
                )

            dataframe = dataframe[
                self.features
            ].copy()

            for feature in self.features:

                dataframe[feature] = pd.to_numeric(
                    dataframe[feature],
                    errors="coerce"
                )

            dataframe = dataframe.dropna()

            print(
                "Valid cardiovascular background rows after "
                f"cleaning: {len(dataframe)}"
            )

            if len(dataframe) == 0:

                raise ValueError(
                    "No valid cardiovascular background "
                    "records are available for SHAP."
                )

            dataframe = dataframe.head(40)

            background_data = dataframe.values.astype(
                np.float32
            )

            background_data = self.scaler.transform(
                background_data
            )

            background_data = np.asarray(
                background_data,
                dtype=np.float32
            )

            print(
                "SHAP background data prepared successfully. "
                f"Shape: {background_data.shape}"
            )

            return background_data

        except Exception as exception:

            print(
                "Warning: Failed to load cardiovascular "
                f"SHAP background data: {exception}"
            )

            return np.zeros(
                (
                    1,
                    len(self.features)
                ),
                dtype=np.float32
            )

    # =============================================================
    # CREATE SHAP EXPLAINER
    # =============================================================

    def _create_shap_explainer(self):

        try:

            # -----------------------------------------------------
            # SHAP explains the original neural-network model.
            # Calibration is intentionally NOT included here.
            # -----------------------------------------------------

            def model_predict(data):

                data = np.asarray(
                    data,
                    dtype=np.float32
                )

                predictions = self.model(
                    data,
                    training=False
                ).numpy()

                return predictions.reshape(
                    -1
                )

            explainer = shap.KernelExplainer(
                model_predict,
                self.background_data
            )

            print(
                "SHAP KernelExplainer created successfully."
            )

            return explainer

        except Exception as exception:

            print(
                "Warning: Failed to create SHAP "
                f"explainer: {exception}"
            )

            return None

    # =============================================================
    # PREPARE FEATURES
    # =============================================================

    def _prepare_features(
        self,
        data: Dict
    ):
        """
        Prepare cardiovascular input features in exactly the same
        order used during model training.
        """

        values = []

        for feature in self.features:

            if feature not in data:

                raise ValueError(
                    "Missing required cardiovascular "
                    f"field: {feature}"
                )

            value = data[feature]

            if value is None:

                raise ValueError(
                    "Cardiovascular field cannot be null: "
                    f"{feature}"
                )

            try:

                value = float(
                    value
                )

            except (
                TypeError,
                ValueError
            ):

                raise ValueError(
                    "Invalid value for cardiovascular "
                    f"field: {feature}"
                )

            values.append(
                value
            )

        features_array = np.asarray(
            [values],
            dtype=np.float32
        )

        scaled_features = self.scaler.transform(
            features_array
        )

        return np.asarray(
            scaled_features,
            dtype=np.float32
        )

    # =============================================================
    # CALIBRATE PROBABILITY
    # =============================================================

    def _calibrate_probability(
        self,
        raw_probability: float
    ) -> float:
        """
        Apply the saved Platt scaling calibration.

        Formula:

            logit(p) = log(p / (1 - p))

            calibrated_logit =
                coefficient * logit(p)
                + intercept

            calibrated_probability =
                sigmoid(calibrated_logit)

        The calibrator artifact stores the coefficient and
        intercept as numeric values.
        """

        raw_probability = float(
            np.clip(
                raw_probability,
                0.0,
                1.0
            )
        )

        clipped_probability = np.clip(
            raw_probability,
            1e-7,
            1.0 - 1e-7
        )

        raw_logit = np.log(
            clipped_probability
            / (
                1.0
                - clipped_probability
            )
        )

        calibrated_logit = (
            self.calibration_coefficient
            * raw_logit
            + self.calibration_intercept
        )

        # ---------------------------------------------------------
        # Numerically stable sigmoid.
        # ---------------------------------------------------------

        if calibrated_logit >= 0:

            exponential = np.exp(
                -calibrated_logit
            )

            calibrated_probability = (
                1.0
                / (
                    1.0
                    + exponential
                )
            )

        else:

            exponential = np.exp(
                calibrated_logit
            )

            calibrated_probability = (
                exponential
                / (
                    1.0
                    + exponential
                )
            )

        return float(
            np.clip(
                calibrated_probability,
                0.0,
                1.0
            )
        )

    # =============================================================
    # RISK BAND
    # =============================================================

    def _get_risk_band(
        self,
        probability: float
    ):
        """
        Convert cardiovascular probability into a risk band.

        < 0.33  -> LOW_SCORE
        < 0.66  -> MODERATE_SCORE
        >= 0.66 -> HIGH_SCORE
        """

        if probability < 0.33:

            return "LOW_SCORE"

        elif probability < 0.66:

            return "MODERATE_SCORE"

        else:

            return "HIGH_SCORE"

    # =============================================================
    # PREDICTION
    # =============================================================

    def predict(
        self,
        data: Dict
    ):
        """
        Generate a cardiovascular risk prediction and
        SHAP-based feature explanation.

        riskProbability is the calibrated probability.

        SHAP contributions explain the underlying neural-network
        model before probability calibration.
        """

        # ---------------------------------------------------------
        # Prepare input features.
        # ---------------------------------------------------------

        features = self._prepare_features(
            data
        )

        # ---------------------------------------------------------
        # Generate raw neural-network prediction.
        # ---------------------------------------------------------

        prediction = self.model(
            features,
            training=False
        ).numpy()

        raw_probability = float(
            np.asarray(
                prediction
            ).reshape(-1)[0]
        )

        # ---------------------------------------------------------
        # Keep raw probability within [0, 1].
        # ---------------------------------------------------------

        raw_probability = float(
            np.clip(
                raw_probability,
                0.0,
                1.0
            )
        )

        # ---------------------------------------------------------
        # Apply Platt probability calibration.
        # ---------------------------------------------------------

        probability = self._calibrate_probability(
            raw_probability
        )

        # ---------------------------------------------------------
        # Determine risk band using calibrated probability.
        # ---------------------------------------------------------

        risk_band = self._get_risk_band(
            probability
        )

        # ---------------------------------------------------------
        # Calculate SHAP values.
        # ---------------------------------------------------------

        shap_values = self._calculate_shap_values(
            features
        )

        # ---------------------------------------------------------
        # Build feature contributions.
        # ---------------------------------------------------------

        feature_contributions = []

        for index, feature in enumerate(
            self.features
        ):

            contribution = float(
                shap_values[index]
            )

            if contribution > 0:

                direction = "INCREASES_RISK"

            elif contribution < 0:

                direction = "DECREASES_RISK"

            else:

                direction = "NEUTRAL"

            item = {
                "feature": feature,
                "shapValue": contribution,
                "direction": direction
            }

            feature_contributions.append(
                item
            )

        # ---------------------------------------------------------
        # Positive contributors.
        # ---------------------------------------------------------

        positive_contributors = sorted(
            [
                item
                for item in feature_contributions
                if item["shapValue"] > 0
            ],
            key=lambda item: item["shapValue"],
            reverse=True
        )

        # ---------------------------------------------------------
        # Negative contributors.
        # ---------------------------------------------------------

        negative_contributors = sorted(
            [
                item
                for item in feature_contributions
                if item["shapValue"] < 0
            ],
            key=lambda item: item["shapValue"]
        )

        # ---------------------------------------------------------
        # Return complete prediction response.
        # ---------------------------------------------------------

        return {
            "model": self.metadata.get(
                "model",
                "cardiovascular_risk"
            ),

            "riskProbability": probability,

            "riskBand": risk_band,

            "featureContributions":
                feature_contributions,

            "positiveContributors":
                positive_contributors,

            "negativeContributors":
                negative_contributors,

            "modelPurpose": self.metadata.get(
                "model_purpose",
                "Educational risk prediction and "
                "clinical decision-support demonstration"
            )
        }

    # =============================================================
    # CALCULATE SHAP VALUES
    # =============================================================

    def _calculate_shap_values(
        self,
        features
    ):
        """
        Calculate SHAP values for a single cardiovascular
        patient prediction.
        """

        if self.shap_explainer is None:

            print(
                "SHAP explainer is unavailable. "
                "Returning zero contributions."
            )

            return np.zeros(
                len(self.features),
                dtype=np.float32
            )

        try:

            print(
                "Calculating cardiovascular SHAP values..."
            )

            shap_values = (
                self.shap_explainer.shap_values(
                    features,
                    nsamples=100
                )
            )

            if isinstance(
                shap_values,
                list
            ):

                shap_values = shap_values[0]

            shap_values = np.asarray(
                shap_values,
                dtype=np.float32
            )

            shap_values = np.squeeze(
                shap_values
            )

            shap_values = shap_values.reshape(
                -1
            )

            if len(shap_values) != len(
                self.features
            ):

                raise ValueError(
                    "SHAP returned an unexpected number "
                    "of values. "
                    f"Expected {len(self.features)}, "
                    f"received {len(shap_values)}."
                )

            print(
                "Cardiovascular SHAP values calculated "
                "successfully."
            )

            return shap_values

        except Exception as exception:

            print(
                "Warning: Failed to calculate cardiovascular "
                f"SHAP values: {exception}"
            )

            return np.zeros(
                len(self.features),
                dtype=np.float32
            )