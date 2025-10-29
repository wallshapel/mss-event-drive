package com.example.notifications.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class WebFluxCorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // ✅ Orígenes permitidos (React + Angular)
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:4200",
                "http://127.0.0.1:4200"
        ));

        // ✅ Métodos y cabeceras
        config.setAllowedMethods(Arrays.asList("GET", "POST", "OPTIONS"));
        config.addAllowedHeader("*");
        config.addExposedHeader("Content-Type");
        config.setAllowCredentials(true);

        // ✅ Tiempo de caché del preflight
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
