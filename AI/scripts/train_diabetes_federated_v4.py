import json
import os

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
# MediSphere Diabetes Federated Training v4
# ============================================================
#
# Same 8-feature schema as the existing MediSphere application.
#
# Federated:
#   Hospital A
#   Hospital B
#   Hospital C
#        ↓
#   Weighted FedAvg
#        ↓
#   Global Diabetes Model
#
# Educational synthetic demonstration.
# NOT a medical diagnosis system.
# ============================================================


RANDOM_STATE = 42

NUM_CLIENTS = 3

CLIENT_EPOCHS = 3

BATCH_SIZE = 32

FEDERATED_ROUNDS = 20

CLIENT_LEARNING_RATE = 0.005

SERVER_LEARNING_RATE = 0.5


BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
    )
)


DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "diabetes_synthetic_v4.csv",
)


MODEL_DIR = os.path.join(
    BASE_DIR,
    "saved_models",
)


MODEL_WEIGHTS_FILE = os.path.join(
    MODEL_DIR,
    "diabetes_federated.weights.h5",
)


SCALER_FILE = os.path.join(
    MODEL_DIR,
    "diabetes_scaler.joblib",
)


METADATA_FILE = os.path.join(
    MODEL_DIR,
    "diabetes_metadata.json",
)


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


np.random.seed(
    RANDOM_STATE
)

tf.random.set_seed(
    RANDOM_STATE
)


# ============================================================
# Model
# ============================================================

def create_keras_model():

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(
                shape=(8,)
            ),

            tf.keras.layers.Dense(
                32,
                activation="relu",
            ),

            tf.keras.layers.Dropout(
                0.05
            ),

            tf.keras.layers.Dense(
                16,
                activation="relu",
            ),

            tf.keras.layers.Dropout(
                0.05
            ),

            tf.keras.layers.Dense(
                1,
                activation="sigmoid",
            ),
        ]
    )

    return model


# ============================================================
# Client dataset
# ============================================================

def make_client_dataset(
    x,
    y,
):

    dataset = tf.data.Dataset.from_tensor_slices(
        (
            x.astype(np.float32),
            y.astype(np.float32).reshape(
                -1,
                1,
            ),
        )
    )

    dataset = dataset.shuffle(
        buffer_size=len(x),
        seed=RANDOM_STATE,
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
# TFF model
# ============================================================

def create_tff_model(
    input_spec,
):

    keras_model = (
        create_keras_model()
    )

    return tff.learning.models.from_keras_model(
        keras_model,
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


# ============================================================
# Split into hospitals
# ============================================================

def split_into_clients(
    x,
    y,
):

    rng = np.random.default_rng(
        RANDOM_STATE
    )

    indices = np.arange(
        len(x)
    )

    rng.shuffle(
        indices
    )

    client_indices = np.array_split(
        indices,
        NUM_CLIENTS,
    )

    clients = []

    print()
    print("Hospital partitions")
    print("-" * 50)

    for index, client_index in enumerate(
        client_indices,
        start=1,
    ):

        client_x = x[
            client_index
        ]

        client_y = y[
            client_index
        ]

        positive = int(
            np.sum(
                client_y == 1
            )
        )

        negative = int(
            np.sum(
                client_y == 0
            )
        )

        print(
            f"Hospital {index}: "
            f"{len(client_index)} records | "
            f"positive={positive} | "
            f"negative={negative}"
        )

        clients.append(
            make_client_dataset(
                client_x,
                client_y,
            )
        )

    return clients


# ============================================================
# Federated training
# ============================================================

def train_federated_model(
    federated_train_data,
):

    input_spec = (
        federated_train_data[0]
        .element_spec
    )

    def model_fn():

        return create_tff_model(
            input_spec
        )

    training_process = (
        tff.learning.algorithms.build_weighted_fed_avg(
            model_fn=model_fn,

            client_optimizer_fn=(
                tff.learning.optimizers.build_sgdm(
                    learning_rate=CLIENT_LEARNING_RATE
                )
            ),

            server_optimizer_fn=(
                tff.learning.optimizers.build_sgdm(
                    learning_rate=SERVER_LEARNING_RATE
                )
            ),
        )
    )

    state = (
        training_process.initialize()
    )

    round_metrics = []

    print()
    print("=" * 70)
    print("FEDERATED TRAINING")
    print("=" * 70)

    for round_number in range(
        1,
        FEDERATED_ROUNDS + 1,
    ):

        output = training_process.next(
            state,
            federated_train_data,
        )

        if hasattr(
            output,
            "state",
        ):

            state = output.state

            metrics = output.metrics

        else:

            state, metrics = output

        train_metrics = (
            metrics[
                "client_work"
            ][
                "train"
            ]
        )

        accuracy = float(
            train_metrics[
                "accuracy"
            ]
        )

        auc = float(
            train_metrics[
                "auc"
            ]
        )

        loss = float(
            train_metrics[
                "loss"
            ]
        )

        update_non_finite = int(
            metrics[
                "client_work"
            ][
                "train"
            ].get(
                "update_non_finite",
                0,
            )
        )

        round_metrics.append(
            {
                "round": round_number,
                "loss": loss,
                "accuracy": accuracy,
                "auc": auc,
                "updateNonFinite": update_non_finite,
            }
        )

        print(
            f"Round {round_number:02d}/{FEDERATED_ROUNDS} | "
            f"loss={loss:.4f} | "
            f"accuracy={accuracy:.4f} | "
            f"auc={auc:.4f} | "
            f"nonFinite={update_non_finite}"
        )

    return (
        training_process,
        state,
        round_metrics,
    )


# ============================================================
# Extract global weights
# ============================================================

def extract_global_weights(
    training_process,
    state,
):

    model_weights = (
        training_process.get_model_weights(
            state
        )
    )

    trainable_weights = [
        np.array(weight)
        for weight in model_weights.trainable
    ]

    non_trainable_weights = [
        np.array(weight)
        for weight in model_weights.non_trainable
    ]

    return (
        trainable_weights
        + non_trainable_weights
    )


# ============================================================
# Evaluation
# ============================================================

def evaluate_model(
    model,
    x_test,
    y_test,
):

    probabilities = (
        model.predict(
            x_test,
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

    auc = roc_auc_score(
        y_test,
        probabilities,
    )

    brier = brier_score_loss(
        y_test,
        probabilities,
    )

    matrix = confusion_matrix(
        y_test,
        predictions,
    )

    print()
    print("=" * 70)
    print("GLOBAL MODEL EVALUATION")
    print("=" * 70)

    print(
        f"Test samples: {len(y_test)}"
    )

    print(
        f"Accuracy:     {accuracy:.4f}"
    )

    print(
        f"ROC-AUC:      {auc:.4f}"
    )

    print(
        f"Brier score:  {brier:.4f}"
    )

    print()
    print("Confusion matrix:")

    print(matrix)

    print()
    print("Classification report:")

    print(
        classification_report(
            y_test,
            predictions,
            digits=4,
            zero_division=0,
        )
    )

    return {
        "accuracy": float(
            accuracy
        ),
        "roc_auc": float(
            auc
        ),
        "brier_score": float(
            brier
        ),
        "confusion_matrix": (
            matrix.tolist()
        ),
    }


# ============================================================
# Convergence
# ============================================================

def analyze_convergence(
    round_metrics,
):

    first = (
        round_metrics[0]
    )

    last = (
        round_metrics[-1]
    )

    accuracy_change = (
        last["accuracy"]
        - first["accuracy"]
    )

    loss_change = (
        last["loss"]
        - first["loss"]
    )

    status = (
        "IMPROVED"
        if (
            accuracy_change >= 0
            and loss_change < 0
        )
        else "REVIEW_REQUIRED"
    )

    return {
        "status": status,
        "rounds": FEDERATED_ROUNDS,
        "firstRoundAccuracy": float(
            first["accuracy"]
        ),
        "lastRoundAccuracy": float(
            last["accuracy"]
        ),
        "accuracyChange": float(
            accuracy_change
        ),
        "firstRoundLoss": float(
            first["loss"]
        ),
        "lastRoundLoss": float(
            last["loss"]
        ),
        "lossChange": float(
            loss_change
        ),
    }


# ============================================================
# Save
# ============================================================

def save_model(
    model,
    scaler,
    evaluation,
    round_metrics,
    convergence,
):

    os.makedirs(
        MODEL_DIR,
        exist_ok=True,
    )

    model.save_weights(
        MODEL_WEIGHTS_FILE
    )

    joblib.dump(
        scaler,
        SCALER_FILE,
    )

    accuracy_target_met = (
        evaluation["accuracy"]
        > 0.90
    )

    metadata = {

        "model":
            "MediSphere Diabetes Risk Federated Model",

        "version":
            "4.0.0",

        "modelVersion":
            "4.0.0",

        "modelType":
            "TensorFlow Federated Weighted FedAvg",

        "framework": {
            "tensorflow":
                tf.__version__,

            "tensorflowFederated":
                tff.__version__,
        },

        "features":
            FEATURE_NAMES,

        "target":
            TARGET_NAME,

        "numClients":
            NUM_CLIENTS,

        "numberOfClients":
            NUM_CLIENTS,

        "clientNames": [
            "Hospital A",
            "Hospital B",
            "Hospital C",
        ],

        "clientEpochs":
            CLIENT_EPOCHS,

        "batchSize":
            BATCH_SIZE,

        "federatedRounds":
            FEDERATED_ROUNDS,

        "clientLearningRate":
            CLIENT_LEARNING_RATE,

        "serverLearningRate":
            SERVER_LEARNING_RATE,

        "trainingSamples":
            0,

        "testSamples":
            0,

        "evaluation":
            evaluation,

        "federatedConvergence": {

            "roundMetrics":
                round_metrics,

            "summary":
                convergence,
        },

        "validation": {

            "validationMethod":
                "Stratified 80/20 held-out test evaluation",

            "accuracyTarget":
                0.90,

            "accuracyTargetStatus":
                (
                    "PASS"
                    if accuracy_target_met
                    else "NOT_MET"
                ),

            "datasetType":
                "synthetic",

            "shapValidation":
                "PENDING",

            "biasAudit":
                "PENDING",

            "calibration":
                "PENDING",

            "clinicalGuidelineValidation":
                "PENDING",
        },

        "trainingDataset":
            "MediSphere synthetic diabetes v4 dataset",

        "datasetType":
            "synthetic",

        "modelPurpose":
            "Educational AI risk prediction and clinical decision-support demonstration. This output is not a medical diagnosis.",

        "clinicalUse":
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
    print("Saved:")
    print(MODEL_WEIGHTS_FILE)
    print(SCALER_FILE)
    print(METADATA_FILE)


# ============================================================
# Main
# ============================================================

def main():

    print()
    print("=" * 70)
    print("MEDISPHERE DIABETES FEDERATED TRAINING v4.0")
    print("=" * 70)

    print()
    print("TensorFlow:", tf.__version__)
    print(
        "TensorFlow Federated:",
        tff.__version__,
    )

    print()
    print("Configuration")
    print("-" * 50)
    print("Clients:", NUM_CLIENTS)
    print("Client epochs:", CLIENT_EPOCHS)
    print("Batch size:", BATCH_SIZE)
    print("Federated rounds:", FEDERATED_ROUNDS)
    print(
        "Client learning rate:",
        CLIENT_LEARNING_RATE,
    )
    print(
        "Server learning rate:",
        SERVER_LEARNING_RATE,
    )
    print(
        "Architecture:",
        "8 -> 32 -> 16 -> 1",
    )

    # --------------------------------------------------------
    # Load synthetic dataset
    # --------------------------------------------------------

    if not os.path.exists(
        DATA_FILE
    ):

        raise FileNotFoundError(
            "v4 synthetic dataset not found. "
            "Run generate_diabetes_v4_data.py first."
        )

    dataframe = pd.read_csv(
        DATA_FILE
    )

    print()
    print(
        "Dataset shape:",
        dataframe.shape,
    )

    print()
    print("Target distribution:")
    print(
        dataframe[
            TARGET_NAME
        ].value_counts()
    )

    # --------------------------------------------------------
    # Separate X and y
    # --------------------------------------------------------

    x = (
        dataframe[
            FEATURE_NAMES
        ]
        .values
        .astype(np.float32)
    )

    y = (
        dataframe[
            TARGET_NAME
        ]
        .values
        .astype(np.float32)
    )

    # --------------------------------------------------------
    # Strict held-out test split
    # --------------------------------------------------------

    (
        x_train,
        x_test,
        y_train,
        y_test,
    ) = train_test_split(
        x,
        y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    print()
    print(
        "Training samples:",
        len(x_train),
    )

    print(
        "Testing samples:",
        len(x_test),
    )

    # --------------------------------------------------------
    # Scale using training data ONLY
    # --------------------------------------------------------

    scaler = StandardScaler()

    x_train = (
        scaler
        .fit_transform(
            x_train
        )
        .astype(np.float32)
    )

    x_test = (
        scaler
        .transform(
            x_test
        )
        .astype(np.float32)
    )

    # --------------------------------------------------------
    # Federated clients
    # --------------------------------------------------------

    federated_train_data = (
        split_into_clients(
            x_train,
            y_train,
        )
    )

    # --------------------------------------------------------
    # Federated training
    # --------------------------------------------------------

    (
        training_process,
        state,
        round_metrics,
    ) = train_federated_model(
        federated_train_data
    )

    # --------------------------------------------------------
    # Extract global model
    # --------------------------------------------------------

    global_weights = (
        extract_global_weights(
            training_process,
            state,
        )
    )

    model = create_keras_model()

    model.set_weights(
        global_weights
    )

    # --------------------------------------------------------
    # Evaluate
    # --------------------------------------------------------

    evaluation = evaluate_model(
        model,
        x_test,
        y_test,
    )

    # --------------------------------------------------------
    # Convergence
    # --------------------------------------------------------

    convergence = (
        analyze_convergence(
            round_metrics
        )
    )

    print()
    print("=" * 70)
    print("FEDERATED CONVERGENCE")
    print("=" * 70)

    print(
        "Status:",
        convergence["status"],
    )

    print(
        "First accuracy:",
        f'{convergence["firstRoundAccuracy"]:.4f}',
    )

    print(
        "Last accuracy:",
        f'{convergence["lastRoundAccuracy"]:.4f}',
    )

    print(
        "Accuracy change:",
        f'{convergence["accuracyChange"]:.4f}',
    )

    print(
        "Loss change:",
        f'{convergence["lossChange"]:.4f}',
    )

    # --------------------------------------------------------
    # Update metadata sample counts
    # --------------------------------------------------------

    save_model(
        model,
        scaler,
        evaluation,
        round_metrics,
        convergence,
    )

    # Update sample counts after save.
    with open(
        METADATA_FILE,
        "r",
        encoding="utf-8",
    ) as file:

        metadata = json.load(
            file
        )

    metadata[
        "trainingSamples"
    ] = len(x_train)

    metadata[
        "testSamples"
    ] = len(x_test)

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
    print("=" * 70)
    print("DIABETES v4 TRAINING COMPLETE")
    print("=" * 70)

    if evaluation["accuracy"] > 0.90:

        print()
        print(
            "🎯 ACCURACY TARGET (>90%): PASS"
        )

    else:

        print()
        print(
            "Accuracy target (>90%): NOT MET"
        )

        print(
            "Do NOT replace the existing model "
            "with this result yet."
        )


if __name__ == "__main__":
    main()