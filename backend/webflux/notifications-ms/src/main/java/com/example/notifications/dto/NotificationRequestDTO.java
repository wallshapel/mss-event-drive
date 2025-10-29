package com.example.notifications.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationRequestDTO {

    @NotBlank(message = "Recipient is required")
    private String recipient;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    @NotNull(message = "Channel is required")
    private Channel channel;

    public enum Channel {
        EMAIL, SMS, PUSH
    }
}
