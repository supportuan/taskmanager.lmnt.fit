package com.taskflow.dto;

import java.time.Instant;

public record AuthResponse(String token, UserResponse user, Instant expiresAt) {}
