package com.taskflow.service;

import com.taskflow.dto.CreateTaskRequest;
import com.taskflow.dto.TaskResponse;
import com.taskflow.dto.UpdateTaskRequest;
import com.taskflow.entity.Task;
import com.taskflow.entity.TaskTag;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TaskService {

    private static final String DEFAULT_STATUS = "PENDING";

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TaskResponse createTask(User user, CreateTaskRequest request) {
        Task task = new Task();
        task.setUser(userRepository.getReferenceById(user.getId()));
        applyCreateFields(task, request);
        applyMetadata(task, request.tags(), request.reminder(), request.recurrence());
        Task saved = taskRepository.save(task);
        return TaskResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listTasks(User user) {
        return taskRepository.findAllByUser_IdOrderByTaskDateAscStartTimeAsc(user.getId()).stream()
                .map(TaskResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(User user, Long taskId) {
        Task task = requireOwnedTask(user.getId(), taskId);
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateTask(User user, Long taskId, UpdateTaskRequest request) {
        Task task = requireOwnedTask(user.getId(), taskId);
        applyUpdateFields(task, request);
        applyMetadata(task, request.tags(), request.reminder(), request.recurrence());
        return TaskResponse.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(User user, Long taskId) {
        if (!taskRepository.existsByIdAndUser_Id(taskId, user.getId())) {
            throw new ResourceNotFoundException("Task not found.");
        }
        taskRepository.deleteByIdAndUser_Id(taskId, user.getId());
    }

    private Task requireOwnedTask(Long userId, Long taskId) {
        return taskRepository
                .findByIdAndUser_Id(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found."));
    }

    private void applyCreateFields(Task task, CreateTaskRequest request) {
        task.setTitle(request.title().trim());
        task.setDescription(normalizeOptionalText(request.description()));
        task.setTaskDate(request.taskDate());
        task.setStartTime(request.startTime());
        task.setEndTime(request.endTime());
        task.setPlannedDuration(request.plannedDuration() != null ? request.plannedDuration() : 0);
        task.setActualDuration(0);
        task.setPriority(normalizeOptionalText(request.priority()));
        task.setCategory(normalizeOptionalText(request.category()));
        task.setStatus(normalizeStatus(request.status()));
        task.setProgress(request.progress() != null ? request.progress() : 0);
    }

    private void applyUpdateFields(Task task, UpdateTaskRequest request) {
        task.setTitle(request.title().trim());
        task.setDescription(normalizeOptionalText(request.description()));
        task.setTaskDate(request.taskDate());
        task.setStartTime(request.startTime());
        task.setEndTime(request.endTime());
        task.setPlannedDuration(request.plannedDuration());
        task.setPriority(normalizeOptionalText(request.priority()));
        task.setCategory(normalizeOptionalText(request.category()));
        String nextStatus = normalizeStatus(request.status());
        task.setStatus(nextStatus);
        task.setProgress(request.progress());
        if (request.actualDuration() != null) {
            task.setActualDuration(request.actualDuration());
        }
        task.setStartedAt(request.startedAt());
        if ("IN_PROGRESS".equals(nextStatus) && task.getStartedAt() == null) {
            task.setStartedAt(Instant.now());
        }
        if ("IN_PROGRESS".equals(nextStatus)) {
            task.setPauseReason(null);
            task.setScheduledResumeAt(null);
        }
        if ("COMPLETED".equals(nextStatus)) {
            task.setStartedAt(null);
            task.setPauseReason(null);
            task.setScheduledResumeAt(null);
            if (request.progress() != null && request.progress() >= 100) {
                if (task.getCompletedAt() == null) {
                    task.setCompletedAt(Instant.now());
                }
            }
        }
        if (!"COMPLETED".equals(nextStatus)) {
            task.setCompletedAt(null);
        }
        if ("PENDING".equals(nextStatus)) {
            task.setStartedAt(null);
            task.setPauseReason(null);
            task.setScheduledResumeAt(null);
        }
        if ("PAUSED".equals(nextStatus)) {
            task.setStartedAt(null);
            if (request.pauseReason() != null) {
                task.setPauseReason(normalizeOptionalText(request.pauseReason()));
            }
            if (request.scheduledResumeAt() != null) {
                task.setScheduledResumeAt(request.scheduledResumeAt());
            }
        }
        if (request.completionSummary() != null) {
            task.setCompletionSummary(normalizeOptionalText(request.completionSummary()));
        }
        if (request.achievement() != null) {
            task.setAchievement(normalizeOptionalText(request.achievement()));
        }
        if (request.reflectionNote() != null) {
            task.setReflectionNote(normalizeOptionalText(request.reflectionNote()));
        }
    }

    private void applyMetadata(Task task, List<String> tags, String reminder, String recurrence) {
        if (tags != null) {
            replaceTags(task, TaskMetadataValidator.normalizeTags(tags));
        }
        task.setReminder(TaskMetadataValidator.normalizeReminder(reminder));
        task.setRecurrence(TaskMetadataValidator.normalizeRecurrence(recurrence));
    }

    private void replaceTags(Task task, List<String> labels) {
        task.getTags().clear();
        for (String label : labels) {
            TaskTag tag = new TaskTag();
            tag.setTask(task);
            tag.setLabel(label);
            task.getTags().add(tag);
        }
    }

    private static String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return DEFAULT_STATUS;
        }
        return status.trim().toUpperCase();
    }

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
