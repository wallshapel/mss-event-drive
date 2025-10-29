package com.example.notifications.services.impl;

import com.example.notifications.dto.NotificationRequestDTO;
import com.example.notifications.dto.NotificationResponseDTO;
import com.example.notifications.exceptions.NotificationSendException;
import com.example.notifications.services.senders.NotificationSender;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class NotificationServiceImplTest {

    private NotificationSender emailSender;
    private NotificationSender smsSender;
    private NotificationSender pushSender;
    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setup() {
        emailSender = Mockito.mock(NotificationSender.class);
        smsSender = Mockito.mock(NotificationSender.class);
        pushSender = Mockito.mock(NotificationSender.class);

        notificationService = new NotificationServiceImpl(List.of(emailSender, smsSender, pushSender));
    }

    @Test
    void debeUsarElSenderCorrecto_paraCanalEmail() {
        NotificationRequestDTO request = new NotificationRequestDTO();
        request.setRecipient("user@example.com");
        request.setMessage("Pago exitoso");
        request.setChannel(NotificationRequestDTO.Channel.EMAIL);

        when(emailSender.supports(NotificationRequestDTO.Channel.EMAIL)).thenReturn(true);
        when(emailSender.send(any(NotificationRequestDTO.class)))
                .thenReturn(Mono.just(new NotificationResponseDTO("Pago exitoso ✅")));

        StepVerifier.create(notificationService.sendNotification(request))
                .expectNextMatches(resp -> resp.getMessage().contains("Pago exitoso"))
                .verifyComplete();

        Mockito.verify(emailSender, Mockito.times(1)).send(any(NotificationRequestDTO.class));
    }

    @Test
    void debeLanzarError_siNoExisteSenderParaElCanal() {
        NotificationRequestDTO request = new NotificationRequestDTO();
        request.setRecipient("123456");
        request.setMessage("SMS no disponible");
        request.setChannel(NotificationRequestDTO.Channel.SMS);

        when(emailSender.supports(NotificationRequestDTO.Channel.SMS)).thenReturn(false);
        when(smsSender.supports(NotificationRequestDTO.Channel.SMS)).thenReturn(false);
        when(pushSender.supports(NotificationRequestDTO.Channel.SMS)).thenReturn(false);

        StepVerifier.create(notificationService.sendNotification(request))
                .expectErrorMatches(e ->
                        e instanceof NotificationSendException &&
                                e.getMessage().contains("No sender available"))
                .verify();
    }

    @Test
    void debePropagarError_siSenderFallaDuranteEnvio() {
        NotificationRequestDTO request = new NotificationRequestDTO();
        request.setRecipient("user@example.com");
        request.setMessage("Fallo simulado");
        request.setChannel(NotificationRequestDTO.Channel.EMAIL);

        when(emailSender.supports(NotificationRequestDTO.Channel.EMAIL)).thenReturn(true);
        when(emailSender.send(any(NotificationRequestDTO.class)))
                .thenReturn(Mono.error(new NotificationSendException("Error interno en el envío")));

        StepVerifier.create(notificationService.sendNotification(request))
                .expectError(NotificationSendException.class)
                .verify();

        Mockito.verify(emailSender, Mockito.times(1)).send(any(NotificationRequestDTO.class));
    }
}
