package com.example.medisphere.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ExternalFhirService {

    private final HttpClient httpClient;

    private final String baseUrl;

    public ExternalFhirService(
            @Value("${medisphere.fhir.external.base-url}")
            String baseUrl) {

        this.baseUrl = baseUrl.replaceAll("/+$", "");

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public ExternalFhirResponse createResource(
            String resourceType,
            String json) {

        try {
            String url =
                    baseUrl + "/" + resourceType;

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .timeout(Duration.ofSeconds(30))
                            .header(
                                    "Content-Type",
                                    "application/fhir+json"
                            )
                            .header(
                                    "Accept",
                                    "application/fhir+json"
                            )
                            .POST(
                                    HttpRequest.BodyPublishers
                                            .ofString(json)
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            return new ExternalFhirResponse(
                    response.statusCode(),
                    response.body()
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to connect to external FHIR server: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    public ExternalFhirResponse updateResource(
            String resourceType,
            String resourceId,
            String json) {

        try {
            String url =
                    baseUrl
                            + "/"
                            + resourceType
                            + "/"
                            + resourceId;

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .timeout(Duration.ofSeconds(30))
                            .header(
                                    "Content-Type",
                                    "application/fhir+json"
                            )
                            .header(
                                    "Accept",
                                    "application/fhir+json"
                            )
                            .PUT(
                                    HttpRequest.BodyPublishers
                                            .ofString(json)
                            )
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            return new ExternalFhirResponse(
                    response.statusCode(),
                    response.body()
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to connect to external FHIR server: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    public ExternalFhirResponse getResource(
            String resourceType,
            String resourceId) {

        try {
            String url =
                    baseUrl
                            + "/"
                            + resourceType
                            + "/"
                            + resourceId;

            HttpRequest request =
                    HttpRequest.newBuilder()
                            .uri(URI.create(url))
                            .timeout(Duration.ofSeconds(30))
                            .header(
                                    "Accept",
                                    "application/fhir+json"
                            )
                            .GET()
                            .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            return new ExternalFhirResponse(
                    response.statusCode(),
                    response.body()
            );

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Unable to connect to external FHIR server: "
                            + exception.getMessage(),
                    exception
            );
        }
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public record ExternalFhirResponse(
            int statusCode,
            String body
    ) {
    }
}