package com.example.notifications.services.impl;

import com.example.notifications.dto.NotificationRequestDTO;
import com.example.notifications.dto.NotificationResponseDTO;
import com.example.notifications.exceptions.NotificationSendException;
import com.example.notifications.services.NotificationService;
import com.example.notifications.services.senders.NotificationSender;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final List<NotificationSender> senders; // Spring inyecta todos los beans que implementen NotificationSender

    @Override
    public Mono<NotificationResponseDTO> sendNotification(NotificationRequestDTO request) {
        return senders.stream()
                .filter(sender -> sender.supports(request.getChannel()))
                .findFirst()
                .map(sender -> sender.send(request))
                .orElseGet(() -> Mono.error(
                        new NotificationSendException("No sender available for channel: " + request.getChannel())
                ));
    }
}