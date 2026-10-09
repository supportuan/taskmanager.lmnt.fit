package com.taskflow.service;

import com.taskflow.dto.AdminUserSummaryResponse;
import com.taskflow.dto.PageResponse;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.UpdateUserStatusRequest;
import com.taskflow.entity.User;
import com.taskflow.entity.UserRole;
import com.taskflow.entity.UserStatus;
import com.taskflow.exception.BadRequestException;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public AdminService(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserSummaryResponse> listUsers() {
        return userRepository.findAllByOrderByNameAscEmailAsc().stream()
                .map(user -> AdminUserSummaryResponse.from(user, taskRepository.countByUser_Id(user.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> listUserTasks(Long userId, int page, int size) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found.");
        }
        int safeSize = Math.min(Math.max(size, 1), 50);
        int safePage = Math.max(page, 0);
        Page<TaskResponse> result = taskRepository
                .findAllByUser_IdOrderByUpdatedAtDescIdDesc(userId, PageRequest.of(safePage, safeSize))
                .map(TaskResponse::from);
        return PageResponse.from(result);
    }

    @Transactional
    public AdminUserSummaryResponse updateUserStatus(Long actorUserId, Long targetUserId, UpdateUserStatusRequest request) {
        if (actorUserId.equals(targetUserId)) {
            throw new BadRequestException("You cannot change your own account status.");
        }

        User target = userRepository
                .findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (target.getRole() == UserRole.SUPER_ADMIN) {
            throw new BadRequestException("Super Admin accounts cannot be blocked or modified here.");
        }

        target.setStatus(request.status());
        User saved = userRepository.save(target);
        return AdminUserSummaryResponse.from(saved, taskRepository.countByUser_Id(saved.getId()));
    }
}
