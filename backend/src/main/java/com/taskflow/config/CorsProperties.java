package com.taskflow.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.cors")
public record CorsProperties(String allowedOrigins) {}
