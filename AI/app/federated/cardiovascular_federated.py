import numpy as np
import tensorflow as tf
import tensorflow_federated as tff

from app.models.cardiovascular import (
    build_cardiovascular_model,
)


# ---------------------------------------------------------
# Create a local hospital dataset
# ---------------------------------------------------------

def create_client_dataset(
    features: np.ndarray,
    labels: np.ndarray,
    batch_size: int = 16,
) -> tf.data.Dataset:
    """
    Create a TensorFlow dataset representing the private
    training data available at one hospital.

    The dataset contains:
        x -> clinical features
        y -> cardiovascular target
    """

    dataset = tf.data.Dataset.from_tensor_slices(
        {
            "x": features.astype(np.float32),
            "y": labels.astype(np.float32),
        }
    )

    dataset = dataset.shuffle(
        buffer_size=max(len(features), 1),
        seed=42,
        reshuffle_each_iteration=True,
    )

    dataset = dataset.batch(batch_size)

    return dataset


# ---------------------------------------------------------
# Build TensorFlow Federated training process
# ---------------------------------------------------------

def build_federated_training_process(
    sample_dataset: tf.data.Dataset,
):
    """
    Build the TensorFlow Federated Weighted FedAvg process.

    Each hospital:
        1. Receives its own local data.
        2. Trains the model locally.
        3. Produces model updates.

    The server:
        1. Receives the client updates.
        2. Aggregates them.
        3. Produces the updated global model.
    """

    input_spec = sample_dataset.element_spec

    def model_fn():
        keras_model = build_cardiovascular_model()

        return tff.learning.models.from_keras_model(
            keras_model=keras_model,
            input_spec=input_spec,
            loss=tf.keras.losses.BinaryCrossentropy(),
            metrics=[
                tf.keras.metrics.BinaryAccuracy(
                    name="accuracy"
                )
            ],
        )

    training_process = (
        tff.learning.algorithms.build_weighted_fed_avg(
            model_fn=model_fn,

            client_optimizer_fn=(
                tff.learning.optimizers.build_sgdm(
                    learning_rate=0.02
                )
            ),

            server_optimizer_fn=(
                tff.learning.optimizers.build_sgdm(
                    learning_rate=1.0
                )
            ),
        )
    )

    return training_process


# ---------------------------------------------------------
# Create simulated hospital clients
# ---------------------------------------------------------

def create_federated_clients(
    features: np.ndarray,
    labels: np.ndarray,
    number_of_clients: int = 3,
):
    """
    Split the training data into separate simulated
    healthcare clients.

    Client mapping:

        Client 1 -> Hospital A
        Client 2 -> Hospital B
        Client 3 -> Hospital C

    Important:
        This function represents separate hospital-local
        datasets for the federated-learning demonstration.

        The raw patient rows are not combined into one
        client dataset during federated training.
    """

    if number_of_clients < 2:
        raise ValueError(
            "Federated learning requires at least "
            "two clients."
        )

    if len(features) != len(labels):
        raise ValueError(
            "Features and labels must contain the same "
            "number of records."
        )

    if len(features) < number_of_clients:
        raise ValueError(
            "Number of clients cannot exceed the number "
            "of training records."
        )

    indices = np.arange(len(features))

    random_generator = np.random.default_rng(42)

    random_generator.shuffle(indices)

    client_indices = np.array_split(
        indices,
        number_of_clients,
    )

    client_datasets = []

    for client_index in client_indices:

        client_features = features[
            client_index
        ]

        client_labels = labels[
            client_index
        ]

        dataset = create_client_dataset(
            client_features,
            client_labels,
        )

        client_datasets.append(dataset)

    return client_datasets