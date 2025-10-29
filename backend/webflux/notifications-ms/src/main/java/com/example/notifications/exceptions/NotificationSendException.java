package com.example.notifications.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class NotificationSendException extends RuntimeException {
    public NotificationSendException(String message) {
        super(message);
    }
}
