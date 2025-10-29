package com.example.notifications.controllers;

import com.example.notifications.dto.ApiResponse;
import com.example.notifications.dto.NotificationRequestDTO;
import com.example.notifications.dto.NotificationResponseDTO;
import com.example.notifications.factory.ResponseFactory;
import com.example.notifications.services.NotificationService;
import com.example.notifications.services.NotificationStream;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationStream notificationStream;

    @PostMapping
    public Mono<ResponseEntity<ApiResponse<NotificationResponseDTO>>> sendNotification(
            @Valid @RequestBody NotificationRequestDTO request) {

        return notificationService.sendNotification(request)
                .map(response -> ResponseFactory.created("Notification sent successfully", response));
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<NotificationResponseDTO>> streamNotifications() {
        return notificationStream.stream()
                .map(data -> ServerSentEvent.<NotificationResponseDTO>builder()
                        .event("notification")
                        .data(data)
                        .build());
    }

}
