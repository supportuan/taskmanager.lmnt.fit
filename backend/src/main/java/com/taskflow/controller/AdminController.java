package com.taskflow.controller;

import com.taskflow.dto.AdminUserSummaryResponse;
import com.taskflow.dto.PageResponse;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.UpdateUserStatusRequest;
import com.taskflow.entity.User;
import com.taskflow.service.AdminService;
import com.taskflow.service.CurrentUserService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CurrentUserService currentUserService;

    public AdminController(AdminService adminService, CurrentUserService currentUserService) {
        this.adminService = adminService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/users")
    public List<AdminUserSummaryResponse> listUsers() {
        return adminService.listUsers();
    }

    @GetMapping("/users/{userId}/tasks")
    public PageResponse<TaskResponse> listUserTasks(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.listUserTasks(userId, page, size);
    }

    @PatchMapping("/users/{userId}/status")
    public AdminUserSummaryResponse updateUserStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        User actor = currentUserService.requireUser(userDetails);
        return adminService.updateUserStatus(actor.getId(), userId, request);
    }
}
