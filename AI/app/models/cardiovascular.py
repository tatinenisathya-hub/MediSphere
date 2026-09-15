import tensorflow as tf


# Number of clinical features expected by the model
INPUT_FEATURE_COUNT = 13


def build_cardiovascular_model() -> tf.keras.Model:
    """
    Build the neural network used for cardiovascular
    risk classification.

    Input:
        13 standardized clinical features.

    Output:
        A probability between 0 and 1.

    This model is used for educational risk prediction
    and clinical decision-support demonstration.
    It is not a medical diagnosis system.
    """

    model = tf.keras.Sequential(
        [
            tf.keras.layers.Input(
                shape=(INPUT_FEATURE_COUNT,),
                name="clinical_features",
            ),

            tf.keras.layers.Dense(
                32,
                activation="relu",
                name="hidden_1",
            ),

            tf.keras.layers.Dense(
                16,
                activation="relu",
                name="hidden_2",
            ),

            tf.keras.layers.Dense(
                1,
                activation="sigmoid",
                name="risk_probability",
            ),
        ],
        name="cardiovascular_risk_model",
    )

    return model