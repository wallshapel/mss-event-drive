package com.example.notifications.services.senders;

import com.example.notifications.dto.NotificationRequestDTO;
import com.example.notifications.dto.NotificationResponseDTO;
import reactor.core.publisher.Mono;

public interface NotificationSender {
    boolean supports(NotificationRequestDTO.Channel channel);
    Mono<NotificationResponseDTO> send(NotificationRequestDTO request);
}