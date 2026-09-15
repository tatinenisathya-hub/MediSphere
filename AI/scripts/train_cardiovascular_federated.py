"""
MediSphere - Cardiovascular Federated Training

Purpose:
    Train the cardiovascular risk model using TensorFlow Federated
    Weighted FedAvg across three simulated hospital clients.

Important:
    - Training data is synthetic demonstration data.
    - This model is NOT a clinical diagnostic system.
    - The 13-feature contract remains compatible with the existing
      MediSphere cardiovascular prediction service.

Environment:
    TensorFlow 2.14.1
    TensorFlow Federated 0.64.0

Model version:
    2.0.0
"""

from __future__ import annotations

import collections
import json
import os
import random
from pathlib import Path
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow_federated as tff

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
    brier_score_loss,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


# ============================================================
# CONFIGURATION
# ============================================================

SEED = 42

MODEL_VERSION = "2.0.0"

NUM_CLIENTS = 3

NUM_ROUNDS = 10

BATCH_SIZE = 32

LEARNING_RATE = 0.03

SERVER_LEARNING_RATE = 1.0

TEST_SIZE = 0.20


# ============================================================
# EXISTING MEDISPHERE CVD FEATURE CONTRACT
# ============================================================

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


# IMPORTANT:
# The generated synthetic CSV contains "cvd_target",
# not "target".
TARGET = "cvd_target"


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]


DATA_FILE = (
    PROJECT_ROOT
    / "AI"
    / "data"
    / "raw"
    / "cardiovascular_synthetic.csv"
)


SAVED_MODEL_DIR = (
    PROJECT_ROOT
    / "AI"
    / "saved_models"
)


MODEL_FILE = (
    SAVED_MODEL_DIR
    / "cardiovascular_federated.weights.h5"
)


SCALER_FILE = (
    SAVED_MODEL_DIR
    / "cardiovascular_scaler.joblib"
)


METADATA_FILE = (
    SAVED_MODEL_DIR
    / "cardiovascular_metadata.json"
)


# ============================================================
# RANDOM SEEDS
# ============================================================

def set_seed() -> None:
    """
    Configure deterministic random seeds as far as practical.
    """

    os.environ["PYTHONHASHSEED"] = str(SEED)

    random.seed(SEED)

    np.random.seed(SEED)

    tf.random.set_seed(SEED)


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset() -> pd.DataFrame:
    """
    Load the synthetic cardiovascular dataset.

    Expected CSV structure:

        age
        sex
        cp
        trestbps
        chol
        fbs
        restecg
        thalach
        exang
        oldpeak
        slope
        ca
        thal
        cvd_target
    """

    print("=" * 60)
    print("Loading cardiovascular training dataset")
    print("=" * 60)

    if not DATA_FILE.exists():

        raise FileNotFoundError(
            f"\nTraining dataset not found:\n"
            f"{DATA_FILE}\n\n"
            f"Generate it first using:\n"
            f"python AI/scripts/generate_cvd_training_data.py"
        )

    df = pd.read_csv(
        DATA_FILE
    )

    expected_columns = (
        FEATURES
        + [TARGET]
    )

    missing_columns = [
        column
        for column in expected_columns
        if column not in df.columns
    ]

    if missing_columns:

        raise ValueError(
            "Dataset is missing required columns: "
            + ", ".join(
                missing_columns
            )
        )

    # Keep only the columns required by the model.
    df = df[
        expected_columns
    ].copy()

    # Remove infinity values.
    df = df.replace(
        [np.inf, -np.inf],
        np.nan,
    )

    # Convert all columns to numeric.
    for column in expected_columns:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    # Remove invalid rows.
    df = df.dropna()

    # Convert target to integer.
    df[TARGET] = (
        df[TARGET]
        .astype(int)
    )

    # Validate binary target.
    unique_targets = set(
        df[TARGET].unique()
    )

    invalid_targets = (
        unique_targets
        - {0, 1}
    )

    if invalid_targets:

        raise ValueError(
            "Invalid target values found: "
            + str(
                sorted(
                    invalid_targets
                )
            )
        )

    print(
        f"Dataset shape: {df.shape}"
    )

    positive_cases = int(
        df[TARGET].sum()
    )

    negative_cases = int(
        (df[TARGET] == 0).sum()
    )

    print(
        f"Positive cases: "
        f"{positive_cases}"
    )

    print(
        f"Negative cases: "
        f"{negative_cases}"
    )

    print(
        f"Positive rate: "
        f"{df[TARGET].mean():.4f}"
    )

    return df


# ============================================================
# TRAIN / TEST PREPARATION
# ============================================================

def prepare_data(
    df: pd.DataFrame,
) -> Tuple[
    np.ndarray,
    np.ndarray,
    np.ndarray,
    np.ndarray,
    StandardScaler,
]:
    """
    Create a stratified train/test split.

    The StandardScaler is fitted only on training data.
    """

    X = (
        df[FEATURES]
        .astype(np.float32)
        .values
    )

    y = (
        df[TARGET]
        .astype(np.float32)
        .values
    )

    (
        X_train,
        X_test,
        y_train,
        y_test,
    ) = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=SEED,
        stratify=y,
    )

    scaler = StandardScaler()

    X_train_scaled = (
        scaler
        .fit_transform(
            X_train
        )
        .astype(np.float32)
    )

    X_test_scaled = (
        scaler
        .transform(
            X_test
        )
        .astype(np.float32)
    )

    SAVED_MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        scaler,
        SCALER_FILE,
    )

    print()
    print(
        f"Training samples: "
        f"{len(X_train)}"
    )

    print(
        f"Testing samples: "
        f"{len(X_test)}"
    )

    print(
        "Training positive rate: "
        f"{np.mean(y_train):.4f}"
    )

    print(
        "Testing positive rate: "
        f"{np.mean(y_test):.4f}"
    )

    print(
        f"Scaler saved: "
        f"{SCALER_FILE}"
    )

    return (
        X_train_scaled,
        X_test_scaled,
        y_train,
        y_test,
        scaler,
    )


# ============================================================
# CREATE HOSPITAL CLIENT PARTITIONS
# ============================================================

def create_client_partitions(
    X_train: np.ndarray,
    y_train: np.ndarray,
) -> List[
    Tuple[np.ndarray, np.ndarray]
]:
    """
    Split the training data into three simulated hospitals.

    Hospital A
    Hospital B
    Hospital C

    In a real federated-learning deployment, raw patient
    records would remain at the respective hospital.
    """

    rng = np.random.default_rng(
        SEED
    )

    indices = np.arange(
        len(X_train)
    )

    rng.shuffle(
        indices
    )

    client_indices = np.array_split(
        indices,
        NUM_CLIENTS,
    )

    hospital_names = [
        "Hospital A",
        "Hospital B",
        "Hospital C",
    ]

    clients = []

    print()
    print("=" * 60)
    print("FEDERATED CLIENTS")
    print("=" * 60)

    for name, client_idx in zip(
        hospital_names,
        client_indices,
    ):

        client_X = X_train[
            client_idx
        ]

        client_y = y_train[
            client_idx
        ]

        clients.append(
            (
                client_X,
                client_y,
            )
        )

        print(
            f"{name}: "
            f"{len(client_X)} samples"
        )

        print(
            "  Positive rate: "
            f"{np.mean(client_y):.4f}"
        )

    return clients


# ============================================================
# CREATE TF DATASET
# ============================================================

def create_tf_dataset(
    X: np.ndarray,
    y: np.ndarray,
    training: bool = True,
) -> tf.data.Dataset:
    """
    Create a TensorFlow dataset for a federated client.
    """

    dataset = (
        tf.data.Dataset
        .from_tensor_slices(
            (
                X.astype(
                    np.float32
                ),
                y.astype(
                    np.float32
                ),
            )
        )
    )

    if training:

        dataset = dataset.shuffle(
            buffer_size=len(X),
            seed=SEED,
            reshuffle_each_iteration=True,
        )

    dataset = dataset.batch(
        BATCH_SIZE
    )

    dataset = dataset.prefetch(
        tf.data.AUTOTUNE
    )

    return dataset


# ============================================================
# KERAS MODEL
# ============================================================

def create_keras_model() -> tf.keras.Model:
    """
    Create the cardiovascular neural network.

    Input:
        13 features

    Architecture:
        Dense 64
        ReLU
        Dropout 0.10

        Dense 32
        ReLU
        Dropout 0.10

        Dense 16
        ReLU

        Dense 1
        Sigmoid
    """

    model = tf.keras.Sequential(
        [

            tf.keras.layers.Input(
                shape=(
                    len(FEATURES),
                ),
                name=(
                    "cardiovascular_features"
                ),
            ),

            tf.keras.layers.Dense(
                64,
                activation="relu",
                name="dense_64",
            ),

            tf.keras.layers.Dropout(
                0.10,
                name="dropout_1",
            ),

            tf.keras.layers.Dense(
                32,
                activation="relu",
                name="dense_32",
            ),

            tf.keras.layers.Dropout(
                0.10,
                name="dropout_2",
            ),

            tf.keras.layers.Dense(
                16,
                activation="relu",
                name="dense_16",
            ),

            tf.keras.layers.Dense(
                1,
                activation="sigmoid",
                name="risk_probability",
            ),
        ]
    )

    return model


# ============================================================
# TFF MODEL
# ============================================================

def create_tff_model():
    """
    Create a TFF VariableModel.

    Compatible with:

        TensorFlow 2.14.1
        TensorFlow Federated 0.64.0

    Required TFF methods implemented:

        predict_on_batch()
        forward_pass()
        report_local_unfinalized_metrics()
        metric_finalizers()
        reset_metrics()
    """

    loss_fn = (
        tf.keras.losses.BinaryCrossentropy(
            from_logits=False
        )
    )

    input_spec = (
        tf.TensorSpec(
            shape=[
                None,
                len(FEATURES),
            ],
            dtype=tf.float32,
        ),

        tf.TensorSpec(
            shape=[
                None
            ],
            dtype=tf.float32,
        ),
    )

    class Model(
        tff.learning.models.VariableModel
    ):

        def __init__(
            self
        ):

            super().__init__()

            self._keras_model = (
                create_keras_model()
            )

            self._input_spec = (
                input_spec
            )

            self._loss = (
                loss_fn
            )

            self._num_examples = (
                tf.Variable(
                    0,
                    dtype=tf.int64,
                    trainable=False,
                    name=(
                        "num_examples"
                    ),
                )
            )

            self._num_batches = (
                tf.Variable(
                    0,
                    dtype=tf.int64,
                    trainable=False,
                    name=(
                        "num_batches"
                    ),
                )
            )

        # ====================================================
        # TRAINABLE VARIABLES
        # ====================================================

        @property
        def trainable_variables(
            self
        ):

            return (
                self._keras_model
                .trainable_variables
            )

        # ====================================================
        # NON-TRAINABLE VARIABLES
        # ====================================================

        @property
        def non_trainable_variables(
            self
        ):

            return (
                self._keras_model
                .non_trainable_variables
            )

        # ====================================================
        # LOCAL VARIABLES
        # ====================================================

        @property
        def local_variables(
            self
        ):

            return [
                self._num_examples,
                self._num_batches,
            ]

        # ====================================================
        # INPUT SPECIFICATION
        # ====================================================

        @property
        def input_spec(
            self
        ):

            return (
                self._input_spec
            )

        # ====================================================
        # PREDICT ON BATCH
        # ====================================================

        @tf.function
        def predict_on_batch(
            self,
            batch_input,
            training=True,
        ):
            """
            Required by TFF 0.64.0.

            Generates predictions for one batch.
            """

            features, _ = (
                batch_input
            )

            predictions = (
                self._keras_model(
                    features,
                    training=training,
                )
            )

            predictions = tf.reshape(
                predictions,
                [-1],
            )

            return predictions

        # ====================================================
        # FORWARD PASS
        # ====================================================

        @tf.function
        def forward_pass(
            self,
            batch,
            training=True,
        ):
            """
            Perform one local client training step.
            """

            features, labels = (
                batch
            )

            labels = tf.cast(
                labels,
                tf.float32,
            )

            predictions = (
                self._keras_model(
                    features,
                    training=training,
                )
            )

            predictions = tf.reshape(
                predictions,
                [-1],
            )

            loss = self._loss(
                labels,
                predictions,
            )

            batch_size = (
                tf.shape(
                    labels
                )[0]
            )

            self._num_examples.assign_add(
                tf.cast(
                    batch_size,
                    tf.int64,
                )
            )

            self._num_batches.assign_add(
                1
            )

            return (
                tff.learning.models.BatchOutput(
                    loss=loss,
                    predictions=predictions,
                    num_examples=batch_size,
                )
            )

        # ====================================================
        # REPORT LOCAL METRICS
        # ====================================================

        @tf.function
        def report_local_unfinalized_metrics(
            self,
        ):
            """
            Return local unfinalized metrics.

            The metric names MUST exactly match the names
            returned by metric_finalizers().
            """

            return (
                collections.OrderedDict(
                    num_examples=[
                        self._num_examples
                    ],

                    num_batches=[
                        self._num_batches
                    ],
                )
            )

        # ====================================================
        # METRIC FINALIZERS
        # ====================================================

        def metric_finalizers(
            self,
        ):
            """
            Required by TFF 0.64.0.

            Each finalizer receives the unfinalized metric
            structure and returns its finalized value.

            The keys here must exactly match
            report_local_unfinalized_metrics().
            """

            return (
                collections.OrderedDict(

                    num_examples=(
                        lambda x:
                        tf.cast(
                            x[0],
                            tf.float32,
                        )
                    ),

                    num_batches=(
                        lambda x:
                        tf.cast(
                            x[0],
                            tf.float32,
                        )
                    ),
                )
            )

        # ====================================================
        # RESET METRICS
        # ====================================================

        def reset_metrics(
            self,
        ):
            """
            Reset local metric variables.
            """

            self._num_examples.assign(
                0
            )

            self._num_batches.assign(
                0
            )

    return Model()


# ============================================================
# BUILD FEDERATED TRAINING PROCESS
# ============================================================

def create_federated_training_process():

    print()
    print(
        "Building TensorFlow Federated "
        "Weighted FedAvg process..."
    )

    def model_fn():

        # TFF requires a fresh model for every invocation.
        return create_tff_model()

    process = (
        tff.learning.algorithms
        .build_weighted_fed_avg(

            model_fn=model_fn,

            client_optimizer_fn=(
                lambda:
                tf.keras.optimizers.SGD(
                    learning_rate=(
                        LEARNING_RATE
                    )
                )
            ),

            server_optimizer_fn=(
                lambda:
                tf.keras.optimizers.SGD(
                    learning_rate=(
                        SERVER_LEARNING_RATE
                    )
                )
            ),
        )
    )

    print(
        "Federated training process "
        "initialized successfully."
    )

    return process


# ============================================================
# COPY TFF WEIGHTS TO KERAS
# ============================================================

def assign_tff_weights_to_keras(
    state,
    keras_model: tf.keras.Model,
) -> None:
    """
    Copy global TFF model weights into a Keras model.
    """

    model_weights = (
        state.global_model_weights
    )

    trainable_weights = [
        np.array(value)
        for value in (
            model_weights.trainable
        )
    ]

    non_trainable_weights = [
        np.array(value)
        for value in (
            model_weights.non_trainable
        )
    ]

    combined_weights = (
        trainable_weights
        + non_trainable_weights
    )

    expected_count = len(
        keras_model.weights
    )

    if len(
        combined_weights
    ) != expected_count:

        raise RuntimeError(
            "TFF/Keras weight count mismatch.\n"
            f"TFF returned "
            f"{len(combined_weights)} weights.\n"
            f"Keras expects "
            f"{expected_count} weights."
        )

    keras_model.set_weights(
        combined_weights
    )


# ============================================================
# EXPECTED CALIBRATION ERROR
# ============================================================

def calculate_ece(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    bins: int = 10,
) -> float:
    """
    Calculate Expected Calibration Error.

    ECE <= 0.10 is used as an engineering review
    threshold for this demonstration.
    """

    y_true = np.asarray(
        y_true
    )

    probabilities = np.asarray(
        probabilities
    )

    ece = 0.0

    bin_edges = np.linspace(
        0.0,
        1.0,
        bins + 1,
    )

    for index in range(
        bins
    ):

        lower = (
            bin_edges[index]
        )

        upper = (
            bin_edges[index + 1]
        )

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

        confidence = np.mean(
            probabilities[mask]
        )

        accuracy = np.mean(
            y_true[mask]
        )

        weight = np.mean(
            mask
        )

        ece += (
            weight
            * abs(
                accuracy
                - confidence
            )
        )

    return float(
        ece
    )


# ============================================================
# MODEL EVALUATION
# ============================================================

def evaluate_model(
    model: tf.keras.Model,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> Dict:
    """
    Evaluate the final global model.
    """

    print()
    print("=" * 60)
    print(
        "GLOBAL MODEL EVALUATION"
    )
    print("=" * 60)

    probabilities = (
        model.predict(
            X_test,
            batch_size=BATCH_SIZE,
            verbose=0,
        )
        .reshape(-1)
    )

    predictions = (
        probabilities >= 0.5
    ).astype(int)

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    try:

        roc_auc = (
            roc_auc_score(
                y_test,
                probabilities,
            )
        )

    except ValueError:

        roc_auc = 0.0

    brier_score = (
        brier_score_loss(
            y_test,
            probabilities,
        )
    )

    ece = calculate_ece(
        y_test,
        probabilities,
    )

    cm = confusion_matrix(
        y_test,
        predictions,
    )

    report_text = (
        classification_report(
            y_test,
            predictions,
            digits=4,
            zero_division=0,
        )
    )

    report_dict = (
        classification_report(
            y_test,
            predictions,
            output_dict=True,
            zero_division=0,
        )
    )

    print(
        f"Accuracy : "
        f"{accuracy:.4f}"
    )

    print(
        f"ROC-AUC  : "
        f"{roc_auc:.4f}"
    )

    print(
        f"Brier    : "
        f"{brier_score:.4f}"
    )

    print(
        f"ECE      : "
        f"{ece:.4f}"
    )

    print()
    print(
        "Confusion Matrix:"
    )

    print(
        cm
    )

    print()
    print(
        "Classification Report:"
    )

    print(
        report_text
    )

    print()

    if accuracy > 0.90:

        print(
            "Accuracy > 90%: PASS"
        )

    else:

        print(
            "Accuracy > 90%: FAIL"
        )

    if ece <= 0.10:

        print(
            "Calibration ECE <= 0.10: PASS"
        )

    else:

        print(
            "Calibration ECE <= 0.10: REVIEW"
        )

    return {

        "accuracy":
            float(
                accuracy
            ),

        "roc_auc":
            float(
                roc_auc
            ),

        "brier_score":
            float(
                brier_score
            ),

        "ece":
            float(
                ece
            ),

        "confusion_matrix":
            cm.tolist(),

        "classification_report":
            report_dict,
    }


# ============================================================
# CONVERGENCE ANALYSIS
# ============================================================

def analyze_convergence(
    round_metrics: List[Dict],
) -> Dict:
    """
    Analyze whether training improved across federated rounds.

    This is an engineering indicator, not a formal proof
    of mathematical convergence.
    """

    if not round_metrics:

        return {
            "status": "NO_DATA",
            "rounds": 0,
        }

    accuracies = [
        float(
            item[
                "accuracy"
            ]
        )
        for item in round_metrics
    ]

    losses = [
        float(
            item[
                "loss"
            ]
        )
        for item in round_metrics
    ]

    first_accuracy = (
        accuracies[0]
    )

    last_accuracy = (
        accuracies[-1]
    )

    first_loss = (
        losses[0]
    )

    last_loss = (
        losses[-1]
    )

    accuracy_change = (
        last_accuracy
        - first_accuracy
    )

    loss_change = (
        last_loss
        - first_loss
    )

    if (
        accuracy_change > 0
        or loss_change < 0
    ):

        status = "IMPROVED"

    else:

        status = "STABLE_REVIEW"

    return {

        "status":
            status,

        "rounds":
            len(
                round_metrics
            ),

        "first_round_accuracy":
            first_accuracy,

        "last_round_accuracy":
            last_accuracy,

        "accuracy_change":
            accuracy_change,

        "first_round_loss":
            first_loss,

        "last_round_loss":
            last_loss,

        "loss_change":
            loss_change,
    }


# ============================================================
# SAVE METADATA
# ============================================================

def save_metadata(
    evaluation: Dict,
    round_metrics: List[Dict],
    convergence: Dict,
    training_samples: int,
    test_samples: int,
) -> None:
    """
    Save model metadata for the MediSphere AI service.
    """

    metadata = {

        "model":
            "cardiovascular_risk",

        "modelVersion":
            MODEL_VERSION,

        "framework":
            "TensorFlow",

        "tensorflowVersion":
            tf.__version__,

        "federated_framework":
            "TensorFlow Federated",

        "federatedFrameworkVersion":
            tff.__version__,

        "federated_algorithm":
            "Weighted FedAvg",

        "number_of_clients":
            NUM_CLIENTS,

        "client_names": [
            "Hospital A",
            "Hospital B",
            "Hospital C",
        ],

        "number_of_rounds":
            NUM_ROUNDS,

        "batch_size":
            BATCH_SIZE,

        "client_learning_rate":
            LEARNING_RATE,

        "server_learning_rate":
            SERVER_LEARNING_RATE,

        "features":
            FEATURES,

        "target":
            TARGET,

        "training_samples":
            training_samples,

        "test_samples":
            test_samples,

        "accuracy":
            evaluation[
                "accuracy"
            ],

        "roc_auc":
            evaluation[
                "roc_auc"
            ],

        "brier_score":
            evaluation[
                "brier_score"
            ],

        "ece":
            evaluation[
                "ece"
            ],

        "evaluation":
            evaluation,

        "round_metrics":
            round_metrics,

        "convergence":
            convergence,

        "target_definition":
            (
                "0 = lower cardiovascular risk; "
                "1 = higher cardiovascular risk "
                "according to the synthetic "
                "demonstration target"
            ),

        "training_dataset":
            (
                "MediSphere synthetic "
                "cardiovascular training dataset"
            ),

        "dataset_type":
            "synthetic",

        "model_purpose":
            (
                "Educational AI risk prediction "
                "and clinical decision-support "
                "demonstration. This output is "
                "not a medical diagnosis."
            ),

        "clinical_use":
            False,
    }

    with open(
        METADATA_FILE,
        "w",
        encoding="utf-8",
    ) as file:

        json.dump(
            metadata,
            file,
            indent=2,
        )

    print()
    print(
        f"Metadata saved: "
        f"{METADATA_FILE}"
    )


# ============================================================
# MAIN
# ============================================================

def main() -> None:

    # --------------------------------------------------------
    # RANDOM SEED
    # --------------------------------------------------------

    set_seed()

    # --------------------------------------------------------
    # HEADER
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print(
        "MEDISPHERE CVD FEDERATED TRAINING"
    )
    print("=" * 60)

    print(
        f"TensorFlow version: "
        f"{tf.__version__}"
    )

    print(
        f"TFF version: "
        f"{tff.__version__}"
    )

    print(
        f"Model version: "
        f"{MODEL_VERSION}"
    )

    print(
        f"Federated clients: "
        f"{NUM_CLIENTS}"
    )

    print(
        f"Federated rounds: "
        f"{NUM_ROUNDS}"
    )

    print("=" * 60)

    # --------------------------------------------------------
    # 1. LOAD DATASET
    # --------------------------------------------------------

    df = load_dataset()

    # --------------------------------------------------------
    # 2. PREPARE TRAIN / TEST DATA
    # --------------------------------------------------------

    (
        X_train,
        X_test,
        y_train,
        y_test,
        scaler,
    ) = prepare_data(
        df
    )

    # --------------------------------------------------------
    # 3. CREATE HOSPITAL CLIENTS
    # --------------------------------------------------------

    client_partitions = (
        create_client_partitions(
            X_train,
            y_train,
        )
    )

    # --------------------------------------------------------
    # 4. CREATE FEDERATED DATASETS
    # --------------------------------------------------------

    federated_train_data = []

    for (
        client_X,
        client_y,
    ) in client_partitions:

        client_dataset = (
            create_tf_dataset(
                client_X,
                client_y,
                training=True,
            )
        )

        federated_train_data.append(
            client_dataset
        )

    # --------------------------------------------------------
    # 5. BUILD TFF FEDAVG PROCESS
    # --------------------------------------------------------

    process = (
        create_federated_training_process()
    )

    # --------------------------------------------------------
    # 6. INITIALIZE GLOBAL STATE
    # --------------------------------------------------------

    print()
    print(
        "Initializing federated state..."
    )

    state = (
        process.initialize()
    )

    print(
        "Federated state initialized."
    )

    # --------------------------------------------------------
    # 7. FEDERATED TRAINING
    # --------------------------------------------------------

    round_metrics = []

    print()
    print("=" * 60)
    print(
        "STARTING FEDERATED TRAINING"
    )
    print("=" * 60)

    for round_num in range(
        1,
        NUM_ROUNDS + 1,
    ):

        print()
        print(
            f"FEDERATED ROUND "
            f"{round_num}/{NUM_ROUNDS}"
        )

        print(
            "-" * 60
        )

        # Execute one FedAvg round.
        state, metrics = (
            process.next(
                state,
                federated_train_data,
            )
        )

        print(
            f"Round {round_num} "
            f"completed."
        )

        print()
        print(
            "TFF metrics:"
        )

        print(
            metrics
        )

        # ----------------------------------------------------
        # Evaluate global model on training data.
        # ----------------------------------------------------

        temp_model = (
            create_keras_model()
        )

        assign_tff_weights_to_keras(
            state,
            temp_model,
        )

        train_probabilities = (
            temp_model
            .predict(
                X_train,
                batch_size=BATCH_SIZE,
                verbose=0,
            )
            .reshape(-1)
        )

        train_predictions = (
            train_probabilities >= 0.5
        ).astype(int)

        train_accuracy = (
            accuracy_score(
                y_train,
                train_predictions,
            )
        )

        train_brier = (
            brier_score_loss(
                y_train,
                train_probabilities,
            )
        )

        round_record = {

            "round":
                round_num,

            "accuracy":
                float(
                    train_accuracy
                ),

            "loss":
                float(
                    train_brier
                ),
        }

        round_metrics.append(
            round_record
        )

        print()
        print(
            f"Global training accuracy: "
            f"{train_accuracy:.4f}"
        )

        print(
            f"Global training loss: "
            f"{train_brier:.4f}"
        )

    # --------------------------------------------------------
    # 8. CONVERGENCE
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print(
        "FEDERATED CONVERGENCE"
    )
    print("=" * 60)

    convergence = (
        analyze_convergence(
            round_metrics
        )
    )

    print(
        f"Status: "
        f"{convergence['status']}"
    )

    print(
        f"Rounds: "
        f"{convergence['rounds']}"
    )

    print(
        "First-round accuracy: "
        f"{convergence['first_round_accuracy']:.4f}"
    )

    print(
        "Last-round accuracy: "
        f"{convergence['last_round_accuracy']:.4f}"
    )

    print(
        "Accuracy change: "
        f"{convergence['accuracy_change']:.4f}"
    )

    print(
        "First-round loss: "
        f"{convergence['first_round_loss']:.4f}"
    )

    print(
        "Last-round loss: "
        f"{convergence['last_round_loss']:.4f}"
    )

    print(
        "Loss change: "
        f"{convergence['loss_change']:.4f}"
    )

    # --------------------------------------------------------
    # 9. CREATE FINAL KERAS MODEL
    # --------------------------------------------------------

    print()
    print(
        "Creating final Keras model..."
    )

    final_model = (
        create_keras_model()
    )

    assign_tff_weights_to_keras(
        state,
        final_model,
    )

    # --------------------------------------------------------
    # 10. FINAL TEST EVALUATION
    # --------------------------------------------------------

    evaluation = (
        evaluate_model(
            final_model,
            X_test,
            y_test,
        )
    )

    # --------------------------------------------------------
    # 11. SAVE MODEL
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print(
        "SAVING FINAL MODEL"
    )
    print("=" * 60)

    SAVED_MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    final_model.save_weights(
        MODEL_FILE
    )

    print(
        f"Model weights saved: "
        f"{MODEL_FILE}"
    )

    # --------------------------------------------------------
    # 12. SAVE METADATA
    # --------------------------------------------------------

    save_metadata(
        evaluation=evaluation,

        round_metrics=(
            round_metrics
        ),

        convergence=(
            convergence
        ),

        training_samples=(
            len(X_train)
        ),

        test_samples=(
            len(X_test)
        ),
    )

    # --------------------------------------------------------
    # 13. FINAL SUMMARY
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print(
        "TRAINING COMPLETE"
    )
    print("=" * 60)

    print(
        f"CVD Accuracy : "
        f"{evaluation['accuracy']:.4f}"
    )

    print(
        f"CVD ROC-AUC  : "
        f"{evaluation['roc_auc']:.4f}"
    )

    print(
        f"CVD Brier    : "
        f"{evaluation['brier_score']:.4f}"
    )

    print(
        f"CVD ECE      : "
        f"{evaluation['ece']:.4f}"
    )

    print(
        "Accuracy > 90%: "
        f"{'PASS' if evaluation['accuracy'] > 0.90 else 'FAIL'}"
    )

    print(
        "Calibration: "
        f"{'PASS' if evaluation['ece'] <= 0.10 else 'REVIEW'}"
    )

    print(
        f"Convergence: "
        f"{convergence['status']}"
    )

    print()
    print(
        "Saved files:"
    )

    print(
        f"  Model:  "
        f"{MODEL_FILE}"
    )

    print(
        f"  Scaler: "
        f"{SCALER_FILE}"
    )

    print(
        f"  Meta:   "
        f"{METADATA_FILE}"
    )

    print()
    print(
        "IMPORTANT:"
    )

    print(
        "This model is trained on synthetic "
        "demonstration data. Its metrics are "
        "development/demo metrics and must "
        "not be presented as clinical "
        "validation or a medical diagnosis."
    )

    print("=" * 60)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()