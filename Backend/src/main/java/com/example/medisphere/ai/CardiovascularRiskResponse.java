package com.example.medisphere.ai;

import java.util.List;

public class CardiovascularRiskResponse {

    private String model;

    private Double riskProbability;

    private String riskBand;

    private List<FeatureContribution> featureContributions;

    private List<FeatureContribution> positiveContributors;

    private List<FeatureContribution> negativeContributors;

    private String modelPurpose;

    public CardiovascularRiskResponse() {
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Double getRiskProbability() {
        return riskProbability;
    }

    public void setRiskProbability(Double riskProbability) {
        this.riskProbability = riskProbability;
    }

    public String getRiskBand() {
        return riskBand;
    }

    public void setRiskBand(String riskBand) {
        this.riskBand = riskBand;
    }

    public List<FeatureContribution> getFeatureContributions() {
        return featureContributions;
    }

    public void setFeatureContributions(
            List<FeatureContribution> featureContributions) {
        this.featureContributions = featureContributions;
    }

    public List<FeatureContribution> getPositiveContributors() {
        return positiveContributors;
    }

    public void setPositiveContributors(
            List<FeatureContribution> positiveContributors) {
        this.positiveContributors = positiveContributors;
    }

    public List<FeatureContribution> getNegativeContributors() {
        return negativeContributors;
    }

    public void setNegativeContributors(
            List<FeatureContribution> negativeContributors) {
        this.negativeContributors = negativeContributors;
    }

    public String getModelPurpose() {
        return modelPurpose;
    }

    public void setModelPurpose(String modelPurpose) {
        this.modelPurpose = modelPurpose;
    }

    public static class FeatureContribution {

        private String feature;

        private Double shapValue;

        private String direction;

        public FeatureContribution() {
        }

        public String getFeature() {
            return feature;
        }

        public void setFeature(String feature) {
            this.feature = feature;
        }

        public Double getShapValue() {
            return shapValue;
        }

        public void setShapValue(Double shapValue) {
            this.shapValue = shapValue;
        }

        public String getDirection() {
            return direction;
        }

        public void setDirection(String direction) {
            this.direction = direction;
        }
    }
}