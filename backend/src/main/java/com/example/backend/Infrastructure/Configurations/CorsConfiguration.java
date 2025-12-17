package com.example.backend.Infrastructure.Configurations;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class WebCorsConfiguration {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Разрешаем домены
        config.addAllowedOrigin("https://landor-shop.ru");
        config.addAllowedOrigin("http://landor-shop.ru");
        config.addAllowedOrigin("https://www.landor-shop.ru");
        config.addAllowedOrigin("http://www.landor-shop.ru");
        
        // Для разработки - можно добавить localhost
        config.addAllowedOrigin("http://localhost:8081");
        config.addAllowedOrigin("http://localhost:3000");
        
        // Разрешаем все HTTP методы
        config.addAllowedMethod("*");
        
        // Разрешаем все заголовки
        config.addAllowedHeader("*");
        
        // Разрешаем отправку cookies и авторизационных заголовков
        config.setAllowCredentials(true);
        
        // Разрешаем доступ к заголовкам ответа
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");
        
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}

