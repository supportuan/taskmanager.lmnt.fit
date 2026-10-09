package com.taskflow.dto;

import com.taskflow.entity.User;
import com.taskflow.entity.UserRole;
import com.taskflow.entity.UserStatus;

public record UserResponse(Long id, String name, String email, UserRole role, UserStatus status) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus());
    }
}
