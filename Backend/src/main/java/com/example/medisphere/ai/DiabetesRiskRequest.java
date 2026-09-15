package com.example.medisphere.ai;

import com.fasterxml.jackson.annotation.JsonAlias;

public class DiabetesRiskRequest {

    private Double pregnancies;

    private Double glucose;

    @JsonAlias("bloodPressure")
    private Double bloodpressure;

    @JsonAlias("skinThickness")
    private Double skinthickness;

    private Double insulin;

    private Double bmi;

    @JsonAlias({
            "diabetesPedigree",
            "diabetesPedigreeFunction"
    })
    private Double diabetespedigreefunction;

    private Double age;

    public DiabetesRiskRequest() {
    }

    public Double getPregnancies() {
        return pregnancies;
    }

    public void setPregnancies(Double pregnancies) {
        this.pregnancies = pregnancies;
    }

    public Double getGlucose() {
        return glucose;
    }

    public void setGlucose(Double glucose) {
        this.glucose = glucose;
    }

    public Double getBloodpressure() {
        return bloodpressure;
    }

    public void setBloodpressure(Double bloodpressure) {
        this.bloodpressure = bloodpressure;
    }

    public Double getSkinthickness() {
        return skinthickness;
    }

    public void setSkinthickness(Double skinthickness) {
        this.skinthickness = skinthickness;
    }

    public Double getInsulin() {
        return insulin;
    }

    public void setInsulin(Double insulin) {
        this.insulin = insulin;
    }

    public Double getBmi() {
        return bmi;
    }

    public void setBmi(Double bmi) {
        this.bmi = bmi;
    }

    public Double getDiabetespedigreefunction() {
        return diabetespedigreefunction;
    }

    public void setDiabetespedigreefunction(
            Double diabetespedigreefunction) {

        this.diabetespedigreefunction =
                diabetespedigreefunction;
    }

    public Double getAge() {
        return age;
    }

    public void setAge(Double age) {
        this.age = age;
    }
}