package com.taskflow.dto;

import com.taskflow.entity.User;
import com.taskflow.entity.UserRole;
import com.taskflow.entity.UserStatus;

public record AdminUserSummaryResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        UserStatus status,
        long taskCount) {

    public static AdminUserSummaryResponse from(User user, long taskCount) {
        return new AdminUserSummaryResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus(), taskCount);
    }
}
