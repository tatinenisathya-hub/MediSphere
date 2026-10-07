package com.example.medisphere.service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

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

    /*
     * All currently connected SSE clients.
     */
    private final List<SseEmitter> emitters =
            new CopyOnWriteArrayList<>();

    /*
     * Dedicated scheduler for SSE keep-alive messages.
     */
    private final ScheduledExecutorService scheduler =
            Executors.newScheduledThreadPool(1);

    /*
     * Subscribe a frontend client to the SSE stream.
     */
    public SseEmitter subscribe() {

        /*
         * Keep the connection alive for 30 minutes.
         */
        SseEmitter emitter =
                new SseEmitter(30 * 60 * 1000L);

        emitters.add(emitter);

        log.info(
                "New SSE client connected. Active clients: {}",
                emitters.size()
        );

        /*
         * Keep-alive task.
         *
         * Sends a small SSE comment every 15 seconds.
         * This prevents the connection from being considered
         * idle by the browser, proxy, or server.
         */
        ScheduledFuture<?> heartbeatTask =
                scheduler.scheduleAtFixedRate(
                        () -> {

                            if (!emitters.contains(emitter)) {
                                return;
                            }

                            try {

                                emitter.send(
                                        SseEmitter.event()
                                                .comment("keep-alive")
                                );

                                log.debug(
                                        "SSE keep-alive sent. Active clients: {}",
                                        emitters.size()
                                );

                            } catch (IOException exception) {

                                log.warn(
                                        "SSE keep-alive failed. Removing client."
                                );

                                emitters.remove(emitter);

                                emitter.completeWithError(
                                        exception
                                );
                            }

                        },
                        15,
                        15,
                        TimeUnit.SECONDS
                );

        /*
         * Remove emitter when the connection completes.
         */
        emitter.onCompletion(() -> {

            emitters.remove(emitter);

            heartbeatTask.cancel(false);

            log.info(
                    "SSE client disconnected. Active clients: {}",
                    emitters.size()
            );
        });

        /*
         * Handle timeout.
         */
        emitter.onTimeout(() -> {

            emitters.remove(emitter);

            heartbeatTask.cancel(false);

            log.info(
                    "SSE client timed out. Active clients: {}",
                    emitters.size()
            );

            emitter.complete();
        });

        /*
         * Handle connection errors.
         */
        emitter.onError((exception) -> {

            emitters.remove(emitter);

            heartbeatTask.cancel(false);

            log.warn(
                    "SSE client connection error. Active clients: {}",
                    emitters.size(),
                    exception
            );
        });

        /*
         * Send the initial connection event asynchronously.
         *
         * This is intentionally scheduled after the emitter
         * has been returned/registered rather than immediately
         * during controller execution.
         */
        scheduler.execute(() -> {

            try {

                if (emitters.contains(emitter)) {

                    emitter.send(
                            SseEmitter.event()
                                    .name("connection")
                                    .data(
                                            "SSE connection established"
                                    )
                    );

                    log.info(
                            "Initial SSE connection event sent."
                    );
                }

            } catch (IOException exception) {

                log.error(
                        "Failed to send initial SSE connection message",
                        exception
                );

                emitters.remove(emitter);

                heartbeatTask.cancel(false);

                emitter.completeWithError(
                        exception
                );
            }
        });

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
                    objectMapper.writeValueAsString(
                            notification
                    );

        } catch (JsonProcessingException exception) {

            log.error(
                    "Failed to convert notification to JSON",
                    exception
            );

            return;
        }

        /*
         * Send notification to every connected SSE client.
         */
        for (SseEmitter emitter : emitters) {

            try {

                emitter.send(
                        SseEmitter.event()
                                .name("doctor-notification")
                                .data(notificationJson)
                );

                log.info(
                        "Doctor notification sent through SSE."
                );

            } catch (IOException exception) {

                log.warn(
                        "Failed to send notification to SSE client. "
                                + "Removing client.",
                        exception
                );

                emitters.remove(emitter);

                emitter.completeWithError(
                        exception
                );
            }
        }

        log.info(
                "Doctor notification broadcast to {} clients",
                emitters.size()
        );
    }
}