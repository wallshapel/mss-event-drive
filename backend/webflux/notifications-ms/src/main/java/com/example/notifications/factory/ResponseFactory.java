package com.example.notifications.factory;

import com.example.notifications.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseFactory {

    public static <T> ResponseEntity<ApiResponse<T>> created(String message, T data) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success(message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> error(HttpStatus status, String message, T data) {
        return ResponseEntity
                .status(status)
                .body(ApiResponse.error(message, data));
    }
}
