package com.example.notifications.kafka;

import com.example.notifications.dto.NotificationResponseDTO;
import com.example.notifications.services.NotificationStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * 🔹 Escucha eventos "order_created" provenientes del Orders.MS (Django)
 * y los reenvía al flujo SSE para que el frontend Angular (pagador)
 * reciba las nuevas órdenes disponibles en tiempo real.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderCreatedConsumer {

    private final NotificationStream notificationStream;

    @KafkaListener(topics = "order_created", groupId = "notifications-ms-group")
    public void consume(String message) {
        try {
            log.info("📩 Received order_created event: {}", message);

            JSONObject json = new JSONObject(message);
            String orderId = json.optString("orderId", "N/A");
            String description = json.optString("description", "(sin descripción)");
            double amount = json.optDouble("amount", 0.0);
            String status = json.optString("status", "PENDING");

            // 🧩 Construimos el mensaje amigable para el pagador (Angular)
            String msg = String.format(
                    "Nueva orden disponible 💰\nID: %s\nDescripción: %s\nMonto: $%.2f\nEstado: %s",
                    orderId, description, amount, status
            );

            NotificationResponseDTO response = new NotificationResponseDTO();
            response.setMessage(msg);

            // 🚀 Publicar al flujo SSE (Angular lo recibirá)
            notificationStream.publish(response);

            log.info("📤 Notification sent to SSE stream for order {}", orderId);

        } catch (Exception e) {
            log.error("❌ Error processing order_created event: {}", e.getMessage(), e);
        }
    }
}
