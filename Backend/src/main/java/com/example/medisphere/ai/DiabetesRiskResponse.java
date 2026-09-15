package com.example.medisphere.ai;

import java.util.List;

public class DiabetesRiskResponse {

    private String model;

    private Double riskProbability;

    private Double riskPercentage;

    private String riskBand;

    private String modelPurpose;

    private List<FeatureContribution> featureContributions;

    private List<FeatureContribution> positiveContributors;

    private List<FeatureContribution> negativeContributors;

    public DiabetesRiskResponse() {
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

    public Double getRiskPercentage() {
        return riskPercentage;
    }

    public void setRiskPercentage(Double riskPercentage) {
        this.riskPercentage = riskPercentage;
    }

    public String getRiskBand() {
        return riskBand;
    }

    public void setRiskBand(String riskBand) {
        this.riskBand = riskBand;
    }

    public String getModelPurpose() {
        return modelPurpose;
    }

    public void setModelPurpose(String modelPurpose) {
        this.modelPurpose = modelPurpose;
    }

    public List<FeatureContribution> getFeatureContributions() {
        return featureContributions;
    }

    public void setFeatureContributions(
            List<FeatureContribution> featureContributions) {

        this.featureContributions =
                featureContributions;
    }

    public List<FeatureContribution> getPositiveContributors() {
        return positiveContributors;
    }

    public void setPositiveContributors(
            List<FeatureContribution> positiveContributors) {

        this.positiveContributors =
                positiveContributors;
    }

    public List<FeatureContribution> getNegativeContributors() {
        return negativeContributors;
    }

    public void setNegativeContributors(
            List<FeatureContribution> negativeContributors) {

        this.negativeContributors =
                negativeContributors;
    }

    public static class FeatureContribution {

        private String feature;

        private Double contribution;

        private String direction;

        public FeatureContribution() {
        }

        public String getFeature() {
            return feature;
        }

        public void setFeature(String feature) {
            this.feature = feature;
        }

        public Double getContribution() {
            return contribution;
        }

        public void setContribution(Double contribution) {
            this.contribution = contribution;
        }

        public String getDirection() {
            return direction;
        }

        public void setDirection(String direction) {
            this.direction = direction;
        }
    }
}