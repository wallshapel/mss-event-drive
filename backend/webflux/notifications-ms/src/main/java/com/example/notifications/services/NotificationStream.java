package com.example.notifications.services;

import com.example.notifications.dto.NotificationResponseDTO;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

@Service
public class NotificationStream {

    private final Sinks.Many<NotificationResponseDTO> sink;

    public NotificationStream() {
        this.sink = Sinks.many().replay().limit(1);
    }

    public void publish(NotificationResponseDTO notification) {
        sink.tryEmitNext(notification);
    }

    public Flux<NotificationResponseDTO> stream() {
        return sink.asFlux();
    }
}
