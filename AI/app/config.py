from pathlib import Path


# ---------------------------------------------------------
# MediSphere AI directory configuration
# ---------------------------------------------------------

# AI/
AI_ROOT = Path(__file__).resolve().parents[1]

# AI/data/
DATA_DIR = AI_ROOT / "data"

# AI/data/raw/
RAW_DATA_DIR = DATA_DIR / "raw"

# AI/saved_models/
SAVED_MODELS_DIR = AI_ROOT / "saved_models"


# ---------------------------------------------------------
# Cardiovascular model files
# ---------------------------------------------------------

# Synthetic cardiovascular development dataset
CARDIOVASCULAR_DATASET = (
    RAW_DATA_DIR / "cardiovascular_synthetic.csv"
)

# Federated TensorFlow model weights
CARDIOVASCULAR_WEIGHTS = (
    SAVED_MODELS_DIR
    / "cardiovascular_federated.weights.h5"
)

# StandardScaler used during model training
CARDIOVASCULAR_SCALER = (
    SAVED_MODELS_DIR
    / "cardiovascular_scaler.joblib"
)

# Post-hoc probability calibrator
CARDIOVASCULAR_CALIBRATOR = (
    SAVED_MODELS_DIR
    / "cardiovascular_calibrator.joblib"
)

# Training/evaluation metadata
CARDIOVASCULAR_METADATA = (
    SAVED_MODELS_DIR
    / "cardiovascular_metadata.json"
)


# ---------------------------------------------------------
# Cardiovascular model input features
# ---------------------------------------------------------

CARDIOVASCULAR_FEATURES = [
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