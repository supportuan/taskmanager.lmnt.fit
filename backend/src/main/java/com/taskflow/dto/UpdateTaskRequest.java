package com.taskflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record UpdateTaskRequest(
        @NotBlank(message = "Title is required.")
        @Size(max = 500, message = "Title is too long.")
        String title,

        @Size(max = 10000, message = "Description is too long.")
        String description,

        @NotNull(message = "Task date is required.")
        LocalDate taskDate,

        LocalTime startTime,

        LocalTime endTime,

        @NotNull(message = "Planned duration is required.")
        @Min(value = 0, message = "Planned duration must be zero or greater.")
        Integer plannedDuration,

        @Size(max = 50, message = "Priority is too long.")
        String priority,

        @Size(max = 100, message = "Category is too long.")
        String category,

        @Size(max = 50, message = "Status is too long.")
        String status,

        @NotNull(message = "Progress is required.")
        @Min(value = 0, message = "Progress must be between 0 and 100.")
        @Max(value = 100, message = "Progress must be between 0 and 100.")
        Integer progress,

        @Min(value = 0, message = "Actual duration must be zero or greater.")
        Integer actualDuration,

        Instant startedAt,

        @Size(max = 5000, message = "Pause reason is too long.")
        String pauseReason,

        Instant scheduledResumeAt,

        @Size(max = 10000, message = "Completion summary is too long.")
        String completionSummary,

        @Size(max = 10000, message = "Achievement is too long.")
        String achievement,

        @Size(max = 10000, message = "Reflection note is too long.")
        String reflectionNote,

        List<@Size(max = 100, message = "Tag is too long.") String> tags,

        @Size(max = 10, message = "Reminder is too long.")
        String reminder,

        @Size(max = 20, message = "Recurrence is too long.")
        String recurrence
) {}
