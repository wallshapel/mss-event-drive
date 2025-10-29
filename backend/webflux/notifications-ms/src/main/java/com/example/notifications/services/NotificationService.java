package com.example.notifications.services;

import com.example.notifications.dto.NotificationRequestDTO;
import com.example.notifications.dto.NotificationResponseDTO;
import reactor.core.publisher.Mono;

public interface NotificationService {
    Mono<NotificationResponseDTO> sendNotification(NotificationRequestDTO request);
}
