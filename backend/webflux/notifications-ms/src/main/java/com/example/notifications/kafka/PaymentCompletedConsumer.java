package com.example.notifications.kafka;

import com.example.notifications.dto.NotificationResponseDTO;
import com.example.notifications.services.NotificationStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCompletedConsumer {

    private final NotificationStream notificationStream;

    @KafkaListener(topics = "payment_completed", groupId = "notifications-ms-group")
    public void consume(String message) {
        try {
            log.info("📩 Received payment_completed event: {}", message);

            JSONObject json = new JSONObject(message);
            String orderId = json.getString("orderId");
            String status = json.getString("status");

            String msg;
            if ("APPROVED".equalsIgnoreCase(status)) {
                msg = "Order " + orderId + " has been paid successfully ✅";
            } else {
                msg = "Order " + orderId + " payment failed ❌";
            }

            // 👉 Creamos directamente el DTO que el SSE enviará al frontend
            NotificationResponseDTO response = new NotificationResponseDTO();
            response.setMessage(msg);

            // 🚀 Publicamos al flujo SSE
            notificationStream.publish(response);

            log.info("📤 Notification sent to stream for order {}", orderId);

        } catch (Exception e) {
            log.error("❌ Error processing payment_completed event: {}", e.getMessage(), e);
        }
    }
}
