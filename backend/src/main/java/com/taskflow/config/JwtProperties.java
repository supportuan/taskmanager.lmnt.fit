package com.taskflow.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "taskflow.jwt")
public record JwtProperties(String secret, long expirationMs) {}
