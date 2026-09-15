from typing import List

from pydantic import BaseModel, Field


class CardiovascularPredictionRequest(BaseModel):
    """
    Input features expected by the cardiovascular model.

    These are the clinical features used by the public
    UCI Heart Disease training dataset.
    """

    age: float = Field(
        ...,
        description="Patient age in years",
    )

    sex: float = Field(
        ...,
        description="Dataset sex encoding",
    )

    cp: float = Field(
        ...,
        description="Chest-pain type encoding",
    )

    trestbps: float = Field(
        ...,
        description="Resting blood pressure",
    )

    chol: float = Field(
        ...,
        description="Serum cholesterol",
    )

    fbs: float = Field(
        ...,
        description="Fasting blood sugar encoding",
    )

    restecg: float = Field(
        ...,
        description="Resting ECG encoding",
    )

    thalach: float = Field(
        ...,
        description="Maximum heart rate achieved",
    )

    exang: float = Field(
        ...,
        description="Exercise-induced angina encoding",
    )

    oldpeak: float = Field(
        ...,
        description="ST depression",
    )

    slope: float = Field(
        ...,
        description="ST segment slope encoding",
    )

    ca: float = Field(
        ...,
        description="Number of major vessels",
    )

    thal: float = Field(
        ...,
        description="Thalassemia encoding",
    )


class FeatureContribution(BaseModel):
    """
    One SHAP feature contribution.
    """

    feature: str

    shapValue: float

    direction: str


class CardiovascularPredictionResponse(BaseModel):
    """
    Complete cardiovascular model response.
    """

    model: str

    riskProbability: float

    riskBand: str

    featureContributions: List[
        FeatureContribution
    ]

    positiveContributors: List[
        FeatureContribution
    ]

    negativeContributors: List[
        FeatureContribution
    ]

    modelPurpose: str