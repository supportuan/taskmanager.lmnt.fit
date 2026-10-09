package com.taskflow.dto;

import com.taskflow.entity.Task;
import com.taskflow.entity.TaskTag;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String description,
        LocalDate taskDate,
        LocalTime startTime,
        LocalTime endTime,
        Integer plannedDuration,
        Integer actualDuration,
        String priority,
        String category,
        String status,
        Integer progress,
        Instant startedAt,
        Instant completedAt,
        String pauseReason,
        Instant scheduledResumeAt,
        String completionSummary,
        String achievement,
        String reflectionNote,
        Instant createdAt,
        Instant updatedAt,
        List<String> tags,
        String reminder,
        String recurrence
) {

    public static TaskResponse from(Task task) {
        List<String> tagLabels =
                task.getTags().stream().map(TaskTag::getLabel).sorted(String.CASE_INSENSITIVE_ORDER).toList();
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getTaskDate(),
                task.getStartTime(),
                task.getEndTime(),
                task.getPlannedDuration(),
                task.getActualDuration(),
                task.getPriority(),
                task.getCategory(),
                task.getStatus(),
                task.getProgress(),
                task.getStartedAt(),
                task.getCompletedAt(),
                task.getPauseReason(),
                task.getScheduledResumeAt(),
                task.getCompletionSummary(),
                task.getAchievement(),
                task.getReflectionNote(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                tagLabels,
                task.getReminder(),
                task.getRecurrence());
    }
}
