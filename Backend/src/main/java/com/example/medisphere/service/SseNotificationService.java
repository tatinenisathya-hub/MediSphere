
package com.example.medisphere.service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.medisphere.kafka.DoctorNotificationEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SseNotificationService {

    private final ObjectMapper objectMapper;

    private final List<SseEmitter> emitters =
            new CopyOnWriteArrayList<>();

    /*
     * Subscribe a frontend or Postman client to the SSE stream.
     */
    public SseEmitter subscribe() {

        // 30 minutes timeout
        SseEmitter emitter =
                new SseEmitter(30 * 60 * 1000L);

        emitters.add(emitter);

        log.info(
                "New SSE client connected. Active clients: {}",
                emitters.size()
        );

        emitter.onCompletion(() -> {

            emitters.remove(emitter);

            log.info(
                    "SSE client disconnected. Active clients: {}",
                    emitters.size()
            );
        });

        emitter.onTimeout(() -> {

            emitters.remove(emitter);

            log.info(
                    "SSE client timed out. Active clients: {}",
                    emitters.size()
            );

            emitter.complete();
        });

        emitter.onError((exception) -> {

            emitters.remove(emitter);

            log.warn(
                    "SSE client connection error. Active clients: {}",
                    emitters.size()
            );
        });

        try {

            emitter.send(
                    SseEmitter.event()
                            .name("connection")
                            .data("SSE connection established")
            );

        } catch (IOException exception) {

            emitters.remove(emitter);

            log.error(
                    "Failed to send SSE connection message",
                    exception
            );

            emitter.completeWithError(exception);
        }

        return emitter;
    }

    /*
     * Broadcast a doctor notification to all connected clients.
     */
    public void publishNotification(
            DoctorNotificationEvent notification
    ) {

        String notificationJson;

        try {

            notificationJson =
                    objectMapper.writeValueAsString(notification);

        } catch (JsonProcessingException exception) {

            log.error(
                    "Failed to convert notification to JSON",
                    exception
            );

            return;
        }

        for (SseEmitter emitter : emitters) {

            try {

                emitter.send(
                        SseEmitter.event()
                                .name("doctor-notification")
                                .data(notificationJson)
                );

            } catch (IOException exception) {

                log.warn(
                        "Failed to send notification to SSE client"
                );

                emitters.remove(emitter);

                emitter.completeWithError(exception);
            }
        }

        log.info(
                "Doctor notification broadcast to {} clients",
                emitters.size()
        );
    }
}