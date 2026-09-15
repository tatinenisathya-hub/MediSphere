package com.example.medisphere.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class AiRiskService {

    private final RestClient restClient;

    public AiRiskService(
            @Value("${medisphere.ai.base-url}") String aiBaseUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(aiBaseUrl)
                .build();
    }

    // -----------------------------------------------------
    // Cardiovascular prediction
    // -----------------------------------------------------

    public CardiovascularRiskResponse predictCardiovascularRisk(
            CardiovascularRiskRequest request) {

        try {

            CardiovascularRiskResponse response =
                    restClient.post()
                            .uri(
                                    "/api/ai/cardiovascular/predict"
                            )
                            .contentType(
                                    MediaType.APPLICATION_JSON
                            )
                            .body(request)
                            .retrieve()
                            .body(
                                    CardiovascularRiskResponse.class
                            );

            if (response == null) {

                throw new IllegalStateException(
                        "AI service returned an empty "
                                + "cardiovascular response."
                );
            }

            return response;

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Unable to connect to MediSphere AI service at "
                            + "http://localhost:8001. "
                            + "Make sure the FastAPI AI service is running.",
                    exception
            );
        }
    }

    // -----------------------------------------------------
    // Diabetes prediction
    // -----------------------------------------------------

    public DiabetesRiskResponse predictDiabetesRisk(
            DiabetesRiskRequest request) {

        try {

            DiabetesRiskResponse response =
                    restClient.post()
                            .uri(
                                    "/api/ai/diabetes/predict"
                            )
                            .contentType(
                                    MediaType.APPLICATION_JSON
                            )
                            .body(request)
                            .retrieve()
                            .body(
                                    DiabetesRiskResponse.class
                            );

            if (response == null) {

                throw new IllegalStateException(
                        "AI service returned an empty "
                                + "diabetes response."
                );
            }

            return response;

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Unable to connect to MediSphere AI service at "
                            + "http://localhost:8001. "
                            + "Make sure the FastAPI AI service is running.",
                    exception
            );
        }
    }
}