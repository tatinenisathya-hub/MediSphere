package com.example.medisphere.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class AiModelStatusService {

    private final RestClient restClient;

    public AiModelStatusService(
            @Value("${medisphere.ai.base-url}") String aiBaseUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(aiBaseUrl)
                .build();
    }

    // -----------------------------------------------------
    // AI model status
    // -----------------------------------------------------

    public Object getModelStatus() {

        try {

            Object response =
                    restClient.get()
                            .uri("/api/ai/models")
                            .retrieve()
                            .body(Object.class);

            if (response == null) {

                throw new IllegalStateException(
                        "AI service returned an empty model status response."
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
    // AI service health
    // -----------------------------------------------------

    public Object getAiHealth() {

        try {

            Object response =
                    restClient.get()
                            .uri("/health")
                            .retrieve()
                            .body(Object.class);

            if (response == null) {

                throw new IllegalStateException(
                        "AI service returned an empty health response."
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