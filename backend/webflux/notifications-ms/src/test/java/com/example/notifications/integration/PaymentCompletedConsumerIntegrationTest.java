package com.example.notifications.integration;

import com.example.notifications.dto.NotificationResponseDTO;
import com.example.notifications.services.NotificationStream;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
@EmbeddedKafka(partitions = 1, topics = {"payment_completed"})
class PaymentCompletedConsumerIntegrationTest {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @MockitoBean
    private NotificationStream notificationStream; // ✅ Cambiamos el mock al flujo SSE

    private static final org.slf4j.Logger log = LoggerFactory.getLogger(PaymentCompletedConsumerIntegrationTest.class);

    @BeforeEach
    void setup() {
        reset(notificationStream);
    }

    @Test
    void debeProcesarEventoPaymentCompletedYEnviarNotificacion() throws Exception {
        String message = """
                {
                    "orderId": "12345",
                    "status": "APPROVED"
                }
                """;

        kafkaTemplate.send(new ProducerRecord<>("payment_completed", message));

        Thread.sleep(1000); // Esperar a que el listener procese el evento

        verify(notificationStream, timeout(3000).times(1))
                .publish(any(NotificationResponseDTO.class)); // ✅ Verificamos el nuevo flujo
    }

    @Test
    void debeRegistrarErrorSiMensajeKafkaInvalido() throws Exception {
        String invalidMessage = "{ invalid_json }";

        kafkaTemplate.send("payment_completed", invalidMessage);

        Thread.sleep(1000);

        verify(notificationStream, never()).publish(any());
    }
}
