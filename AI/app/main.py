from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.cardiovascular_predictor import CardiovascularPredictor
from app.diabetes_predictor import DiabetesPredictor


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="MediSphere AI Service",
    description="AI risk prediction service for MediSphere",
    version="1.0.0"
)


# ============================================================
# GLOBAL MODEL INSTANCES
# ============================================================

cardiovascular_predictor = None
diabetes_predictor = None


# ============================================================
# RESPONSE MODEL
# ============================================================

class CardiovascularPredictionResponse(BaseModel):
    model: str
    riskProbability: float
    riskBand: str
    featureContributions: list
    positiveContributors: list
    negativeContributors: list
    modelPurpose: str


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def load_models():

    global cardiovascular_predictor
    global diabetes_predictor

    try:

        print(
            "Loading cardiovascular risk model..."
        )

        cardiovascular_predictor = (
            CardiovascularPredictor()
        )

        print(
            "Cardiovascular risk model loaded successfully."
        )

    except Exception as exception:

        cardiovascular_predictor = None

        print(
            "Failed to load cardiovascular model: "
            f"{exception}"
        )

    try:

        print(
            "Loading diabetes risk model..."
        )

        diabetes_predictor = (
            DiabetesPredictor()
        )

        print(
            "Diabetes risk model loaded successfully."
        )

    except Exception as exception:

        diabetes_predictor = None

        print(
            "Failed to load diabetes model: "
            f"{exception}"
        )


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "service": "MediSphere AI Service",
        "status": "UP",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@app.get("/health")
def health():

    cardiovascular_status = (
        "LOADED"
        if cardiovascular_predictor is not None
        else "NOT_LOADED"
    )

    diabetes_status = (
        "LOADED"
        if diabetes_predictor is not None
        else "NOT_LOADED"
    )

    return {
        "status": "UP",
        "service": "MediSphere AI Service",
        "models": [
            "cardiovascular",
            "diabetes"
        ],
        "modelStatus": {
            "cardiovascular": cardiovascular_status,
            "diabetes": diabetes_status
        }
    }


# ============================================================
# AI MODEL STATUS
# ============================================================

@app.get("/api/ai/models")
def get_model_status():
    """
    Return status and metadata for all loaded AI models.
    """

    cardiovascular_status = (
        cardiovascular_predictor.get_model_status()
        if cardiovascular_predictor is not None
        else {
            "status": "NOT_LOADED"
        }
    )

    diabetes_status = (
        diabetes_predictor.get_model_status()
        if diabetes_predictor is not None
        else {
            "status": "NOT_LOADED"
        }
    )

    return {
        "status": "UP",
        "service": "MediSphere AI Service",
        "models": {
            "cardiovascular": cardiovascular_status,
            "diabetes": diabetes_status
        }
    }


# ============================================================
# CARDIOVASCULAR RISK PREDICTION
# ============================================================

@app.post(
    "/api/ai/cardiovascular/predict",
    response_model=CardiovascularPredictionResponse
)
def predict_cardiovascular_risk(
    request: dict
):

    if cardiovascular_predictor is None:

        raise HTTPException(
            status_code=503,
            detail=(
                "Cardiovascular AI model is not loaded."
            )
        )

    try:

        result = cardiovascular_predictor.predict(
            request
        )

        return result

    except ValueError as exception:

        raise HTTPException(
            status_code=400,
            detail=str(exception)
        )

    except Exception as exception:

        raise HTTPException(
            status_code=500,
            detail=(
                "Cardiovascular prediction failed: "
                f"{exception}"
            )
        )


# ============================================================
# DIABETES RISK PREDICTION
# ============================================================

@app.post(
    "/api/ai/diabetes/predict"
)
def predict_diabetes_risk(
    request: dict
):

    if diabetes_predictor is None:

        raise HTTPException(
            status_code=503,
            detail=(
                "Diabetes AI model is not loaded."
            )
        )

    # --------------------------------------------------------
    # Required diabetes features
    # --------------------------------------------------------

    required_fields = [
        "pregnancies",
        "glucose",
        "bloodpressure",
        "skinthickness",
        "insulin",
        "bmi",
        "diabetespedigreefunction",
        "age"
    ]

    # --------------------------------------------------------
    # Validate required fields
    # --------------------------------------------------------

    missing_fields = [
        field
        for field in required_fields
        if field not in request
        or request[field] is None
    ]

    if missing_fields:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "Missing required fields",
                "fields": missing_fields
            }
        )

    try:

        result = diabetes_predictor.predict(
            request
        )

        return result

    except ValueError as exception:

        raise HTTPException(
            status_code=400,
            detail=str(exception)
        )

    except Exception as exception:

        raise HTTPException(
            status_code=500,
            detail=(
                "Diabetes prediction failed: "
                f"{exception}"
            )
        )


# ============================================================
# DIABETES RISK EXPLANATION
# ============================================================

@app.post(
    "/api/ai/diabetes/explain"
)
def explain_diabetes_risk(
    request: dict
):

    if diabetes_predictor is None:

        raise HTTPException(
            status_code=503,
            detail=(
                "Diabetes AI model is not loaded."
            )
        )

    # --------------------------------------------------------
    # Required diabetes features
    # --------------------------------------------------------

    required_fields = [
        "pregnancies",
        "glucose",
        "bloodpressure",
        "skinthickness",
        "insulin",
        "bmi",
        "diabetespedigreefunction",
        "age"
    ]

    # --------------------------------------------------------
    # Validate required fields
    # --------------------------------------------------------

    missing_fields = [
        field
        for field in required_fields
        if field not in request
        or request[field] is None
    ]

    if missing_fields:

        raise HTTPException(
            status_code=400,
            detail={
                "error": "Missing required fields",
                "fields": missing_fields
            }
        )

    try:

        result = diabetes_predictor.explain(
            request
        )

        return result

    except ValueError as exception:

        raise HTTPException(
            status_code=400,
            detail=str(exception)
        )

    except Exception as exception:

        raise HTTPException(
            status_code=500,
            detail=(
                "Diabetes explanation failed: "
                f"{exception}"
            )
        )


# ============================================================
# APPLICATION ENTRY POINT
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )