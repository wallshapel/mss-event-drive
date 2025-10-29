package com.example.notifications.controllers;

import com.example.notifications.dto.ApiResponse;
import com.example.notifications.dto.NotificationRequestDTO;
import com.example.notifications.dto.NotificationResponseDTO;
import com.example.notifications.services.NotificationService;
import com.example.notifications.services.NotificationStream; // ✅ Import necesario
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.core.publisher.Mono;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@WebFluxTest(controllers = NotificationController.class)
class NotificationControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @MockitoBean
    private NotificationService notificationService;

    @MockitoBean
    private NotificationStream notificationStream; // ✅ Mock agregado para evitar error de contexto

    private NotificationRequestDTO validRequest;
    private NotificationResponseDTO validResponse;

    @BeforeEach
    void setup() {
        validRequest = new NotificationRequestDTO();
        validRequest.setRecipient("user@example.com");
        validRequest.setMessage("Payment successful!");
        validRequest.setChannel(NotificationRequestDTO.Channel.EMAIL);

        validResponse = new NotificationResponseDTO("Notification sent successfully ✅");
    }

    @Test
    void debeRetornar201_alEnviarNotificacionValida() {
        when(notificationService.sendNotification(any(NotificationRequestDTO.class)))
                .thenReturn(Mono.just(validResponse));

        webTestClient.post()
                .uri("/api/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(validRequest)
                .exchange()
                .expectStatus().isEqualTo(CREATED)
                .expectBody(ApiResponse.class)
                .value(response -> {
                    assert response.isSuccess();
                    assert response.getData() != null;
                });

        Mockito.verify(notificationService, Mockito.times(1))
                .sendNotification(any(NotificationRequestDTO.class));
    }

    @Test
    void debeRetornar400_siFaltaCampoRequerido() {
        NotificationRequestDTO invalidRequest = new NotificationRequestDTO();
        invalidRequest.setMessage("Incomplete payload"); // Falta recipient y channel

        webTestClient.post()
                .uri("/api/notifications")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(invalidRequest)
                .exchange()
                .expectStatus().isEqualTo(BAD_REQUEST)
                .expectBody()
                .jsonPath("$.success").isEqualTo(false);
    }
}
