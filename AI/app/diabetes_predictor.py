from pathlib import Path
import json

import joblib
import numpy as np
import shap
import tensorflow as tf


class DiabetesPredictor:
    """
    Diabetes risk prediction service for MediSphere.

    Loads:
    - trained TensorFlow model weights
    - feature scaler
    - model metadata

    Provides:
    - diabetes risk prediction
    - SHAP-based explainability
    - model status information
    """

    # ============================================================
    # INITIALIZATION
    # ============================================================

    def __init__(self):

        base_dir = Path(__file__).resolve().parent.parent

        self.model_path = (
            base_dir
            / "saved_models"
            / "diabetes_federated.weights.h5"
        )

        self.scaler_path = (
            base_dir
            / "saved_models"
            / "diabetes_scaler.joblib"
        )

        self.metadata_path = (
            base_dir
            / "saved_models"
            / "diabetes_metadata.json"
        )

        # --------------------------------------------------------
        # Feature names
        # --------------------------------------------------------

        self.feature_names = [
            "pregnancies",
            "glucose",
            "bloodpressure",
            "skinthickness",
            "insulin",
            "bmi",
            "diabetespedigreefunction",
            "age",
        ]

        # --------------------------------------------------------
        # Metadata
        # --------------------------------------------------------

        self.metadata = {}

        # --------------------------------------------------------
        # Load model
        # --------------------------------------------------------

        self.model = self.build_model()

        print("Loading diabetes model weights...")

        self.model.load_weights(
            self.model_path
        )

        print(
            "Diabetes model weights loaded successfully."
        )

        # --------------------------------------------------------
        # Load scaler
        # --------------------------------------------------------

        print("Loading diabetes scaler...")

        self.scaler = joblib.load(
            self.scaler_path
        )

        print(
            "Diabetes scaler loaded successfully."
        )

        # --------------------------------------------------------
        # Load metadata
        # --------------------------------------------------------

        self._load_metadata()

        print(
            "DiabetesPredictor initialized successfully."
        )

    # ============================================================
    # BUILD MODEL
    # ============================================================

    def build_model(self):
        """
        Build the same neural-network architecture used
        during diabetes model training.
        """

        model = tf.keras.Sequential(
            [
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
                ),
            ]
        )

        return model

    # ============================================================
    # LOAD METADATA
    # ============================================================

    def _load_metadata(self):
        """
        Load diabetes model metadata from JSON.
        """

        try:

            if self.metadata_path.exists():

                with open(
                    self.metadata_path,
                    "r",
                    encoding="utf-8"
                ) as file:

                    self.metadata = json.load(
                        file
                    )

            else:

                print(
                    "Warning: Diabetes metadata file "
                    "not found."
                )

                self.metadata = {}

        except Exception as exception:

            print(
                "Warning: Unable to load diabetes "
                f"model metadata: {exception}"
            )

            self.metadata = {}

    # ============================================================
    # MODEL STATUS
    # ============================================================

    def get_model_status(self):
        """
        Return information about the currently loaded
        diabetes risk model.

        This information is used by the MediSphere
        model status endpoint.

        Supports both the current v4 metadata format
        and older MediSphere diabetes metadata formats.
        """

        evaluation = self.metadata.get(
            "evaluation",
            {}
        )

        # --------------------------------------------------------
        # Model version
        # --------------------------------------------------------

        model_version = self.metadata.get(
            "version",
            self.metadata.get(
                "modelVersion",
                "UNKNOWN"
            )
        )

        # --------------------------------------------------------
        # Number of federated clients
        # --------------------------------------------------------

        number_of_clients = self.metadata.get(
            "number_of_clients",
            self.metadata.get(
                "numClients",
                self.metadata.get(
                    "numberOfClients",
                    3
                )
            )
        )

        # --------------------------------------------------------
        # Federated rounds
        # --------------------------------------------------------

        federated_rounds = self.metadata.get(
            "number_of_rounds",
            self.metadata.get(
                "federatedRounds",
                self.metadata.get(
                    "federated_rounds",
                    0
                )
            )
        )

        # --------------------------------------------------------
        # Client epochs
        # --------------------------------------------------------

        client_epochs = self.metadata.get(
            "client_epochs",
            self.metadata.get(
                "clientEpochs",
                2
            )
        )

        # --------------------------------------------------------
        # Batch size
        # --------------------------------------------------------

        batch_size = self.metadata.get(
            "batch_size",
            self.metadata.get(
                "batchSize",
                16
            )
        )

        # --------------------------------------------------------
        # Evaluation metrics
        # --------------------------------------------------------

        accuracy = evaluation.get(
            "accuracy",
            self.metadata.get(
                "accuracy"
            )
        )

        roc_auc = evaluation.get(
            "roc_auc",
            self.metadata.get(
                "roc_auc"
            )
        )

        brier_score = evaluation.get(
            "brier_score",
            self.metadata.get(
                "brier_score"
            )
        )

        ece = evaluation.get(
            "ece",
            self.metadata.get(
                "ece"
            )
        )

        # --------------------------------------------------------
        # Return status
        # --------------------------------------------------------

        return {
            "model": self.metadata.get(
                "model",
                "MediSphere Diabetes Risk Federated Model"
            ),

            "modelVersion": model_version,

            "modelType": self.metadata.get(
                "modelType",
                "TensorFlow Federated Weighted FedAvg"
            ),

            "framework": self.metadata.get(
                "framework",
                {}
            ),

            "features": self.metadata.get(
                "features",
                [
                    "pregnancies",
                    "glucose",
                    "bloodPressure",
                    "skinThickness",
                    "insulin",
                    "bmi",
                    "diabetesPedigree",
                    "age",
                ]
            ),

            "target": self.metadata.get(
                "target",
                "outcome"
            ),

            "numberOfClients": number_of_clients,

            "clientEpochs": client_epochs,

            "batchSize": batch_size,

            "federatedRounds": federated_rounds,

            "accuracy": accuracy,

            "rocAuc": roc_auc,

            "brierScore": brier_score,

            "ece": ece,

            "modelPurpose": self.metadata.get(
                "modelPurpose",
                "Educational AI risk prediction and "
                "clinical decision-support demonstration. "
                "This output is not a medical diagnosis."
            ),

            "status": "LOADED"
        }

    # ============================================================
    # PREPARE FEATURES
    # ============================================================

    def _prepare_features(
        self,
        data
    ):
        """
        Prepare incoming diabetes data in the exact
        feature order expected by the model.
        """

        values = []

        for feature in self.feature_names:

            if feature not in data:

                raise ValueError(
                    f"Missing required diabetes "
                    f"feature: {feature}"
                )

            value = data[feature]

            if value is None:

                raise ValueError(
                    f"Value for diabetes feature "
                    f"'{feature}' cannot be null."
                )

            try:

                values.append(
                    float(value)
                )

            except (
                TypeError,
                ValueError
            ):

                raise ValueError(
                    f"Invalid value for diabetes "
                    f"feature '{feature}': {value}"
                )

        features = np.array(
            [values],
            dtype=np.float32
        )

        # --------------------------------------------------------
        # Apply scaler used during training
        # --------------------------------------------------------

        scaled_features = self.scaler.transform(
            features
        )

        return scaled_features.astype(
            np.float32
        )

    # ============================================================
    # RISK BAND
    # ============================================================

    def _get_risk_band(
        self,
        probability
    ):
        """
        Convert diabetes probability into a risk category.

        < 0.30  -> LOW
        < 0.60  -> MODERATE
        >= 0.60 -> HIGH
        """

        if probability < 0.30:

            return "LOW"

        elif probability < 0.60:

            return "MODERATE"

        else:

            return "HIGH"

    # ============================================================
    # SHAP CALCULATION
    # ============================================================

    def _calculate_shap_values(
        self,
        features
    ):
        """
        Calculate SHAP values for the supplied
        diabetes patient features.

        A small zero-vector background is used to keep
        the explanation lightweight.
        """

        try:

            # ----------------------------------------------------
            # Prediction function used by SHAP
            # ----------------------------------------------------

            def model_predict(
                input_data
            ):

                input_data = np.asarray(
                    input_data,
                    dtype=np.float32
                )

                predictions = self.model.predict(
                    input_data,
                    verbose=0
                )

                return np.asarray(
                    predictions
                ).reshape(-1)

            # ----------------------------------------------------
            # Background data
            # ----------------------------------------------------

            background = np.zeros(
                (
                    1,
                    len(self.feature_names)
                ),
                dtype=np.float32
            )

            # ----------------------------------------------------
            # Create SHAP KernelExplainer
            # ----------------------------------------------------

            explainer = shap.KernelExplainer(
                model_predict,
                background
            )

            # ----------------------------------------------------
            # Calculate SHAP values
            # ----------------------------------------------------

            shap_values = explainer.shap_values(
                features,
                nsamples=100
            )

            # ----------------------------------------------------
            # Handle different SHAP output formats
            # ----------------------------------------------------

            if isinstance(
                shap_values,
                list
            ):

                shap_array = np.asarray(
                    shap_values[0]
                )

            else:

                shap_array = np.asarray(
                    shap_values
                )

            # ----------------------------------------------------
            # Remove unnecessary dimensions
            # ----------------------------------------------------

            shap_array = np.squeeze(
                shap_array
            )

            shap_array = shap_array.reshape(
                -1
            )

            # ----------------------------------------------------
            # Validate result
            # ----------------------------------------------------

            if len(shap_array) != len(
                self.feature_names
            ):

                raise ValueError(
                    "SHAP returned an unexpected "
                    "number of feature contributions. "
                    f"Expected {len(self.feature_names)}, "
                    f"received {len(shap_array)}."
                )

            return shap_array.astype(
                np.float32
            )

        except Exception as exception:

            print(
                "Warning: Failed to calculate diabetes "
                f"SHAP values: {exception}"
            )

            # ----------------------------------------------------
            # Safe fallback
            # ----------------------------------------------------

            return np.zeros(
                len(self.feature_names),
                dtype=np.float32
            )

    # ============================================================
    # BUILD SHAP EXPLANATION
    # ============================================================

    def _build_feature_contributions(
        self,
        data,
        shap_values
    ):
        """
        Convert SHAP values into the response structure
        expected by the Spring Boot DiabetesRiskResponse.

        Java expects:

        feature
        contribution
        direction
        """

        feature_contributions = []

        positive_contributors = []

        negative_contributors = []

        # --------------------------------------------------------
        # Build individual feature explanations
        # --------------------------------------------------------

        for index, feature in enumerate(
            self.feature_names
        ):

            contribution = float(
                shap_values[index]
            )

            # ----------------------------------------------------
            # Determine direction
            # ----------------------------------------------------

            if contribution > 0:

                direction = "INCREASES_RISK"

            elif contribution < 0:

                direction = "DECREASES_RISK"

            else:

                direction = "NEUTRAL"

            # ----------------------------------------------------
            # Keep "contribution" because the existing
            # Java DiabetesRiskResponse expects:
            #
            # Double contribution
            # ----------------------------------------------------

            item = {
                "feature": feature,

                "contribution": contribution,

                "direction": direction
            }

            feature_contributions.append(
                item
            )

            # ----------------------------------------------------
            # Positive contributor
            # ----------------------------------------------------

            if contribution > 0:

                positive_contributors.append(
                    item
                )

            # ----------------------------------------------------
            # Negative contributor
            # ----------------------------------------------------

            elif contribution < 0:

                negative_contributors.append(
                    item
                )

        # --------------------------------------------------------
        # Sort by absolute SHAP impact
        # --------------------------------------------------------

        positive_contributors.sort(
            key=lambda item: abs(
                item["contribution"]
            ),
            reverse=True
        )

        negative_contributors.sort(
            key=lambda item: abs(
                item["contribution"]
            ),
            reverse=True
        )

        return (
            feature_contributions,
            positive_contributors,
            negative_contributors
        )

    # ============================================================
    # PREDICTION
    # ============================================================

    def predict(
        self,
        data
    ):
        """
        Predict diabetes risk.

        Returns:
        - model name
        - risk probability
        - risk percentage
        - risk band
        - SHAP feature contributions
        - positive contributors
        - negative contributors
        - model purpose
        """

        # --------------------------------------------------------
        # Prepare input
        # --------------------------------------------------------

        features = self._prepare_features(
            data
        )

        # --------------------------------------------------------
        # Run prediction
        # --------------------------------------------------------

        prediction = self.model.predict(
            features,
            verbose=0
        )

        probability = float(
            np.asarray(
                prediction
            ).reshape(-1)[0]
        )

        # --------------------------------------------------------
        # Keep probability within valid range
        # --------------------------------------------------------

        probability = max(
            0.0,
            min(
                1.0,
                probability
            )
        )

        # --------------------------------------------------------
        # Calculate percentage
        # --------------------------------------------------------

        risk_percentage = round(
            probability * 100,
            2
        )

        # --------------------------------------------------------
        # Determine risk band
        # --------------------------------------------------------

        risk_band = self._get_risk_band(
            probability
        )

        # --------------------------------------------------------
        # Calculate SHAP explanation
        #
        # This is included directly in predict()
        # so /api/ai/diabetes/predict returns the complete
        # response expected by Spring Boot and React.
        # --------------------------------------------------------

        shap_values = self._calculate_shap_values(
            features
        )

        (
            feature_contributions,
            positive_contributors,
            negative_contributors
        ) = self._build_feature_contributions(
            data,
            shap_values
        )

        # --------------------------------------------------------
        # Return complete result
        # --------------------------------------------------------

        return {
            "model": self.metadata.get(
                "model",
                "MediSphere Diabetes Risk Federated Model"
            ),

            "riskProbability": probability,

            "riskPercentage": risk_percentage,

            "riskBand": risk_band,

            "featureContributions":
                feature_contributions,

            "positiveContributors":
                positive_contributors,

            "negativeContributors":
                negative_contributors,

            "modelPurpose": self.metadata.get(
                "modelPurpose",
                "Educational AI risk prediction and "
                "clinical decision-support demonstration. "
                "This output is not a medical diagnosis."
            )
        }

    # ============================================================
    # SHAP EXPLANATION ENDPOINT SUPPORT
    # ============================================================

    def explain(
        self,
        data
    ):
        """
        Generate SHAP-based explanation for a diabetes
        risk prediction.

        This method remains available for the existing
        /api/ai/diabetes/explain endpoint.
        """

        # --------------------------------------------------------
        # Prepare input
        # --------------------------------------------------------

        features = self._prepare_features(
            data
        )

        # --------------------------------------------------------
        # Calculate SHAP values
        # --------------------------------------------------------

        shap_values = self._calculate_shap_values(
            features
        )

        # --------------------------------------------------------
        # Build feature contributions
        # --------------------------------------------------------

        (
            feature_contributions,
            positive_contributors,
            negative_contributors
        ) = self._build_feature_contributions(
            data,
            shap_values
        )

        # --------------------------------------------------------
        # Get normal prediction
        # --------------------------------------------------------

        prediction_result = self.predict(
            data
        )

        # --------------------------------------------------------
        # Return complete explanation
        # --------------------------------------------------------

        return {
            "model": prediction_result.get(
                "model"
            ),

            "riskProbability":
                prediction_result.get(
                    "riskProbability"
                ),

            "riskPercentage":
                prediction_result.get(
                    "riskPercentage"
                ),

            "riskBand":
                prediction_result.get(
                    "riskBand"
                ),

            "featureContributions":
                feature_contributions,

            "positiveContributors":
                positive_contributors,

            "negativeContributors":
                negative_contributors,

            "modelPurpose":
                prediction_result.get(
                    "modelPurpose"
                )
        }


# ================================================================
# GLOBAL PREDICTOR INSTANCE
# ================================================================

diabetes_predictor = DiabetesPredictor()