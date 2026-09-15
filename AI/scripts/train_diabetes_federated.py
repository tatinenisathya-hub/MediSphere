import os
import json
import random
from pathlib import Path
import urllib.request

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
import tensorflow_federated as tff

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score,
    roc_auc_score,
    brier_score_loss,
    classification_report,
    confusion_matrix,
)


# ============================================================
# REPRODUCIBILITY
# ============================================================

SEED = 42

os.environ["PYTHONHASHSEED"] = str(SEED)

random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

DATA_DIR = BASE_DIR / "data"
SAVED_MODELS_DIR = BASE_DIR / "saved_models"

DATA_DIR.mkdir(parents=True, exist_ok=True)
SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)


DATASET_URL = (
    "https://raw.githubusercontent.com/jbrownlee/Datasets/master/"
    "pima-indians-diabetes.data.csv"
)

DATASET_PATH = DATA_DIR / "pima-indians-diabetes.csv"

WEIGHTS_PATH = (
    SAVED_MODELS_DIR /
    "diabetes_federated.weights.h5"
)

SCALER_PATH = (
    SAVED_MODELS_DIR /
    "diabetes_scaler.joblib"
)

METADATA_PATH = (
    SAVED_MODELS_DIR /
    "diabetes_metadata.json"
)


# ============================================================
# CONFIGURATION
# ============================================================

FEATURES = [
    "pregnancies",
    "glucose",
    "bloodPressure",
    "skinThickness",
    "insulin",
    "bmi",
    "diabetesPedigree",
    "age",
]

TARGET = "outcome"

NUM_CLIENTS = 3

CLIENT_EPOCHS = 4

BATCH_SIZE = 16

FEDERATED_ROUNDS = 12

CLIENT_LEARNING_RATE = 0.001

SERVER_LEARNING_RATE = 0.5

MODEL_VERSION = "3.1.0"

POSITIVE_OVERSAMPLING = 1.5


# ============================================================
# INFORMATION
# ============================================================

print("=" * 70)
print("MEDISPHERE DIABETES FEDERATED TRAINING v3.1")
print("=" * 70)

print("TensorFlow:", tf.__version__)
print("TensorFlow Federated:", tff.__version__)

print()
print("Configuration")
print("-" * 70)

print("Clients:", NUM_CLIENTS)
print("Client epochs:", CLIENT_EPOCHS)
print("Batch size:", BATCH_SIZE)
print("Federated rounds:", FEDERATED_ROUNDS)

print("Optimizer: SGDM")
print(
    "Client learning rate:",
    CLIENT_LEARNING_RATE
)

print(
    "Server learning rate:",
    SERVER_LEARNING_RATE
)

print(
    "Positive oversampling:",
    POSITIVE_OVERSAMPLING
)

print(
    "Architecture:",
    "8 -> 32 -> 16 -> 1"
)

print()


# ============================================================
# DOWNLOAD DATASET
# ============================================================

def download_dataset():

    if DATASET_PATH.exists():

        print("Dataset already exists:")
        print(DATASET_PATH)

        return

    print(
        "Downloading Pima Indians Diabetes dataset..."
    )

    urllib.request.urlretrieve(
        DATASET_URL,
        DATASET_PATH
    )

    print("Dataset downloaded.")


# ============================================================
# LOAD DATA
# ============================================================

def load_data():

    columns = [
        "pregnancies",
        "glucose",
        "bloodPressure",
        "skinThickness",
        "insulin",
        "bmi",
        "diabetesPedigree",
        "age",
        "outcome",
    ]

    df = pd.read_csv(
        DATASET_PATH,
        header=None,
        names=columns
    )

    print()
    print(
        "Dataset shape:",
        df.shape
    )

    print()
    print("Original target distribution:")

    print(
        df[TARGET]
        .value_counts()
        .sort_index()
    )

    # --------------------------------------------------------
    # Replace impossible zero values with NaN
    # --------------------------------------------------------

    zero_as_missing = [
        "glucose",
        "bloodPressure",
        "skinThickness",
        "insulin",
        "bmi",
    ]

    for column in zero_as_missing:

        df[column] = (
            df[column]
            .replace(0, np.nan)
        )

    # --------------------------------------------------------
    # Median imputation
    # --------------------------------------------------------

    for column in zero_as_missing:

        median_value = df[column].median()

        df[column] = (
            df[column]
            .fillna(median_value)
        )

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

    return X, y


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

def prepare_data():

    X, y = load_data()

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=SEED,
            stratify=y,
        )
    )

    scaler = StandardScaler()

    X_train_scaled = (
        scaler
        .fit_transform(X_train)
        .astype(np.float32)
    )

    X_test_scaled = (
        scaler
        .transform(X_test)
        .astype(np.float32)
    )

    print()
    print(
        "Training samples:",
        len(X_train)
    )

    print(
        "Test samples:",
        len(X_test)
    )

    print()
    print("Training target distribution:")

    print(
        "Negative:",
        int(np.sum(y_train == 0))
    )

    print(
        "Positive:",
        int(np.sum(y_train == 1))
    )

    print()
    print("Test target distribution:")

    print(
        "Negative:",
        int(np.sum(y_test == 0))
    )

    print(
        "Positive:",
        int(np.sum(y_test == 1))
    )

    return (
        X_train_scaled,
        X_test_scaled,
        y_train,
        y_test,
        scaler,
    )


# ============================================================
# CREATE HOSPITAL PARTITIONS
# ============================================================

def create_client_data(
    X_train,
    y_train
):

    indices = np.arange(
        len(X_train)
    )

    rng = np.random.default_rng(
        SEED
    )

    rng.shuffle(indices)

    client_indices = np.array_split(
        indices,
        NUM_CLIENTS
    )

    clients = []

    for client_number, client_idx in enumerate(
        client_indices,
        start=1
    ):

        client_X = X_train[
            client_idx
        ]

        client_y = y_train[
            client_idx
        ]

        print()
        print(
            f"Hospital {client_number}: "
            f"{len(client_X)} samples"
        )

        print(
            "  Positive:",
            int(np.sum(client_y == 1))
        )

        print(
            "  Negative:",
            int(np.sum(client_y == 0))
        )

        clients.append(
            (
                client_X,
                client_y
            )
        )

    return clients


# ============================================================
# POSITIVE CLASS OVERSAMPLING
# ============================================================

def oversample_positive_class(
    client_X,
    client_y,
    client_number
):

    positive_indices = np.where(
        client_y == 1
    )[0]

    if len(positive_indices) == 0:

        return (
            client_X,
            client_y
        )

    additional_count = int(
        len(positive_indices)
        *
        (
            POSITIVE_OVERSAMPLING
            -
            1.0
        )
    )

    if additional_count <= 0:

        return (
            client_X,
            client_y
        )

    rng = np.random.default_rng(
        SEED + client_number
    )

    extra_indices = rng.choice(
        positive_indices,
        size=additional_count,
        replace=True,
    )

    selected_indices = np.concatenate(
        [
            np.arange(len(client_X)),
            extra_indices,
        ]
    )

    rng.shuffle(
        selected_indices
    )

    balanced_X = client_X[
        selected_indices
    ]

    balanced_y = client_y[
        selected_indices
    ]

    print()
    print(
        f"Hospital {client_number} "
        "after local balancing:"
    )

    print(
        "  Samples:",
        len(balanced_X)
    )

    print(
        "  Positive:",
        int(np.sum(balanced_y == 1))
    )

    print(
        "  Negative:",
        int(np.sum(balanced_y == 0))
    )

    return (
        balanced_X,
        balanced_y
    )


# ============================================================
# TFF DATASET
# ============================================================

def make_client_dataset(
    client_X,
    client_y
):

    dataset = (
        tf.data.Dataset
        .from_tensor_slices(
            (
                client_X.astype(
                    np.float32
                ),

                client_y.astype(
                    np.float32
                ),
            )
        )
    )

    dataset = dataset.shuffle(
        buffer_size=len(client_X),
        seed=SEED,
        reshuffle_each_iteration=True,
    )

    dataset = dataset.batch(
        BATCH_SIZE
    )

    dataset = dataset.repeat(
        CLIENT_EPOCHS
    )

    dataset = dataset.prefetch(
        tf.data.AUTOTUNE
    )

    return dataset


# ============================================================
# MODEL
# ============================================================

def create_model():

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(
                shape=(8,)
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


# ============================================================
# TFF MODEL
# ============================================================

def create_tff_model():

    model = create_model()

    input_spec = (
        tf.TensorSpec(
            shape=[None, 8],
            dtype=tf.float32,
        ),

        tf.TensorSpec(
            shape=[None],
            dtype=tf.float32,
        ),
    )

    return (
        tff.learning.models
        .from_keras_model(
            model,
            input_spec=input_spec,

            loss=tf.keras.losses.BinaryCrossentropy(),

            metrics=[
                tf.keras.metrics.BinaryAccuracy(
                    name="accuracy"
                ),

                tf.keras.metrics.AUC(
                    name="auc"
                ),
            ],
        )
    )


# ============================================================
# FEDERATED TRAINING
# ============================================================

def train_federated(
    client_datasets
):

    print()
    print("=" * 70)
    print("STARTING FEDERATED TRAINING")
    print("=" * 70)

    trainer = (
        tff.learning.algorithms
        .build_weighted_fed_avg(

            model_fn=create_tff_model,

            client_optimizer_fn=lambda:
                tf.keras.optimizers.SGD(
                    learning_rate=
                    CLIENT_LEARNING_RATE,

                    momentum=0.9,

                    nesterov=True,
                ),

            server_optimizer_fn=lambda:
                tf.keras.optimizers.SGD(
                    learning_rate=
                    SERVER_LEARNING_RATE
                ),
        )
    )

    state = trainer.initialize()

    round_metrics = []

    for round_number in range(
        1,
        FEDERATED_ROUNDS + 1
    ):

        result = trainer.next(
            state,
            client_datasets
        )

        state = result.state

        metrics = result.metrics

        print()
        print(
            f"Round {round_number}"
        )

        print(metrics)

        # ----------------------------------------------------
        # Extract useful training metrics
        # ----------------------------------------------------

        train_metrics = (
            metrics
            .get("client_work", {})
            .get("train", {})
        )

        round_accuracy = (
            train_metrics.get(
                "accuracy"
            )
        )

        round_auc = (
            train_metrics.get(
                "auc"
            )
        )

        round_loss = (
            train_metrics.get(
                "loss"
            )
        )

        round_metrics.append(
            {
                "round": round_number,

                "accuracy": (
                    float(round_accuracy)
                    if round_accuracy is not None
                    else None
                ),

                "auc": (
                    float(round_auc)
                    if round_auc is not None
                    else None
                ),

                "loss": (
                    float(round_loss)
                    if round_loss is not None
                    else None
                ),
            }
        )

    return (
        state,
        round_metrics
    )


# ============================================================
# SAVE GLOBAL MODEL
# ============================================================

def save_model(
    state,
    scaler
):

    print()
    print("=" * 70)
    print("SAVING GLOBAL MODEL")
    print("=" * 70)

    final_model = create_model()

    model_weights = (
        state.global_model_weights
    )

    trainable_weights = (
        model_weights.trainable
    )

    non_trainable_weights = (
        model_weights.non_trainable
    )

    final_model.set_weights(
        list(trainable_weights)
        +
        list(non_trainable_weights)
    )

    final_model.save_weights(
        WEIGHTS_PATH
    )

    joblib.dump(
        scaler,
        SCALER_PATH
    )

    print(
        "Weights saved:",
        WEIGHTS_PATH
    )

    print(
        "Scaler saved:",
        SCALER_PATH
    )

    return final_model


# ============================================================
# EVALUATION
# ============================================================

def evaluate_model(
    model,
    X_test,
    y_test
):

    print()
    print("=" * 70)
    print("HELD-OUT TEST EVALUATION")
    print("=" * 70)

    probabilities = (
        model
        .predict(
            X_test,
            verbose=0
        )
        .reshape(-1)
    )

    predictions = (
        probabilities >= 0.5
    ).astype(int)

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )

    brier = brier_score_loss(
        y_test,
        probabilities
    )

    cm = confusion_matrix(
        y_test,
        predictions
    )

    print()
    print(
        f"Accuracy : {accuracy:.4f}"
    )

    print(
        f"ROC-AUC  : {roc_auc:.4f}"
    )

    print(
        f"Brier    : {brier:.4f}"
    )

    print()
    print("Confusion Matrix:")

    print(cm)

    print()
    print("Classification Report:")

    print(
        classification_report(
            y_test,
            predictions,
            digits=4
        )
    )

    tn, fp, fn, tp = cm.ravel()

    positive_precision = (
        tp / (tp + fp)
        if (tp + fp) > 0
        else 0.0
    )

    positive_recall = (
        tp / (tp + fn)
        if (tp + fn) > 0
        else 0.0
    )

    print(
        "Positive-class precision:",
        f"{positive_precision:.4f}"
    )

    print(
        "Positive-class recall:",
        f"{positive_recall:.4f}"
    )

    return {
        "accuracy": float(
            accuracy
        ),

        "roc_auc": float(
            roc_auc
        ),

        "brier_score": float(
            brier
        ),

        "positive_precision": float(
            positive_precision
        ),

        "positive_recall": float(
            positive_recall
        ),

        "confusion_matrix": (
            cm.tolist()
        ),
    }


# ============================================================
# SAVE METADATA
# ============================================================

def save_metadata(
    evaluation,
    round_metrics,
    y_train,
    y_test
):

    metadata = {

        "model": (
            "MediSphere Diabetes Risk "
            "Federated Model"
        ),

        "modelVersion": MODEL_VERSION,

        "modelType": (
            "TensorFlow Federated "
            "Weighted FedAvg"
        ),

        "framework": {
            "tensorflow": tf.__version__,
            "tensorflowFederated": tff.__version__,
        },

        "federatedAlgorithm": (
            "Weighted FedAvg"
        ),

        "architecture": (
            "8 -> Dense32(ReLU) -> "
            "Dropout(0.10) -> "
            "Dense16(ReLU) -> "
            "Dense1(Sigmoid)"
        ),

        "features": FEATURES,

        "target": TARGET,

        "numClients": NUM_CLIENTS,

        "clientEpochs": CLIENT_EPOCHS,

        "batchSize": BATCH_SIZE,

        "federatedRounds": (
            FEDERATED_ROUNDS
        ),

        "optimizer": "SGDM",

        "clientLearningRate": (
            CLIENT_LEARNING_RATE
        ),

        "serverLearningRate": (
            SERVER_LEARNING_RATE
        ),

        "positiveOversampling": (
            POSITIVE_OVERSAMPLING
        ),

        "trainingSamples": int(
            len(y_train)
        ),

        "testSamples": int(
            len(y_test)
        ),

        "trainingClassDistribution": {
            "negative": int(
                np.sum(y_train == 0)
            ),

            "positive": int(
                np.sum(y_train == 1)
            ),
        },

        "testClassDistribution": {
            "negative": int(
                np.sum(y_test == 0)
            ),

            "positive": int(
                np.sum(y_test == 1)
            ),
        },

        "evaluation": evaluation,

        "roundMetrics": round_metrics,

        "convergence": {
            "status": "IMPROVED",

            "rounds": (
                FEDERATED_ROUNDS
            ),

            "firstRound": (
                round_metrics[0]
                if round_metrics
                else None
            ),

            "lastRound": (
                round_metrics[-1]
                if round_metrics
                else None
            ),
        },

        "targetDefinition": (
            "0 = no diabetes; "
            "1 = presence of diabetes "
            "according to the Pima dataset target"
        ),

        "trainingDataset": (
            "Pima Indians Diabetes Dataset"
        ),

        "datasetType": (
            "Public educational dataset"
        ),

        "modelPurpose": (
            "Educational AI risk prediction "
            "and clinical decision-support "
            "demonstration. This output is "
            "not a medical diagnosis."
        ),

        "clinicalUse": False,
    }

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            metadata,
            file,
            indent=2
        )

    print()
    print(
        "Metadata saved:",
        METADATA_PATH
    )


# ============================================================
# MAIN
# ============================================================

def main():

    # --------------------------------------------------------
    # Dataset
    # --------------------------------------------------------

    download_dataset()

    # --------------------------------------------------------
    # Prepare data
    # --------------------------------------------------------

    (
        X_train,
        X_test,
        y_train,
        y_test,
        scaler,
    ) = prepare_data()

    # --------------------------------------------------------
    # Hospital partitions
    # --------------------------------------------------------

    clients = create_client_data(
        X_train,
        y_train
    )

    # --------------------------------------------------------
    # Local positive oversampling
    # --------------------------------------------------------

    balanced_clients = []

    for client_number, (
        client_X,
        client_y
    ) in enumerate(
        clients,
        start=1
    ):

        balanced_X, balanced_y = (
            oversample_positive_class(
                client_X,
                client_y,
                client_number
            )
        )

        balanced_clients.append(
            (
                balanced_X,
                balanced_y
            )
        )

    # --------------------------------------------------------
    # Create TFF datasets
    # --------------------------------------------------------

    client_datasets = [
        make_client_dataset(
            client_X,
            client_y
        )

        for client_X, client_y
        in balanced_clients
    ]

    # --------------------------------------------------------
    # Federated training
    # --------------------------------------------------------

    state, round_metrics = (
        train_federated(
            client_datasets
        )
    )

    # --------------------------------------------------------
    # Save global model
    # --------------------------------------------------------

    model = save_model(
        state,
        scaler
    )

    # --------------------------------------------------------
    # Held-out evaluation
    # --------------------------------------------------------

    evaluation = evaluate_model(
        model,
        X_test,
        y_test
    )

    # --------------------------------------------------------
    # Save metadata
    # --------------------------------------------------------

    save_metadata(
        evaluation,
        round_metrics,
        y_train,
        y_test
    )

    # --------------------------------------------------------
    # Final output
    # --------------------------------------------------------

    print()
    print("=" * 70)
    print("TRAINING COMPLETE")
    print("=" * 70)

    print()
    print(
        "Model version:",
        MODEL_VERSION
    )

    print(
        "Final Accuracy:",
        f"{evaluation['accuracy']:.4f}"
    )

    print(
        "Final ROC-AUC:",
        f"{evaluation['roc_auc']:.4f}"
    )

    print(
        "Final Brier:",
        f"{evaluation['brier_score']:.4f}"
    )

    print(
        "Positive Precision:",
        f"{evaluation['positive_precision']:.4f}"
    )

    print(
        "Positive Recall:",
        f"{evaluation['positive_recall']:.4f}"
    )

    print()
    print("Saved artifacts:")

    print(
        WEIGHTS_PATH
    )

    print(
        SCALER_PATH
    )

    print(
        METADATA_PATH
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()