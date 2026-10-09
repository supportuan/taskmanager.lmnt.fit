package com.taskflow.controller;

import com.taskflow.dto.CreateTaskRequest;
import com.taskflow.dto.MessageResponse;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.UpdateTaskRequest;
import com.taskflow.entity.User;
import com.taskflow.service.CurrentUserService;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;
    private final CurrentUserService currentUserService;

    public TaskController(TaskService taskService, CurrentUserService currentUserService) {
        this.taskService = taskService;
        this.currentUserService = currentUserService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody CreateTaskRequest request) {
        User user = currentUserService.requireUser(userDetails);
        TaskResponse created = taskService.createTask(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<TaskResponse> listTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = currentUserService.requireUser(userDetails);
        return taskService.listTasks(user);
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        User user = currentUserService.requireUser(userDetails);
        return taskService.getTask(user, id);
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request) {
        User user = currentUserService.requireUser(userDetails);
        return taskService.updateTask(user, id, request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse deleteTask(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        User user = currentUserService.requireUser(userDetails);
        taskService.deleteTask(user, id);
        return new MessageResponse("Task deleted successfully");
    }
}
