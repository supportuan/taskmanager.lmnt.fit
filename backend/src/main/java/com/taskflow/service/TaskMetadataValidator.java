package com.taskflow.service;

import com.taskflow.exception.BadRequestException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

final class TaskMetadataValidator {

    static final int MAX_TAGS = 20;
    static final int MAX_TAG_LABEL_LENGTH = 100;

    private static final Set<String> REMINDER_VALUES = Set.of("5m", "15m", "30m", "1h");
    private static final Set<String> RECURRENCE_VALUES = Set.of("daily", "weekly", "monthly");

    private TaskMetadataValidator() {}

    static List<String> normalizeTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        Map<String, String> uniqueByLower = new LinkedHashMap<>();
        for (String raw : tags) {
            if (raw == null) {
                continue;
            }
            String label = raw.trim();
            if (label.isEmpty()) {
                continue;
            }
            if (label.length() > MAX_TAG_LABEL_LENGTH) {
                throw new BadRequestException("Each tag must be at most " + MAX_TAG_LABEL_LENGTH + " characters.");
            }
            String key = label.toLowerCase(Locale.ROOT);
            uniqueByLower.putIfAbsent(key, label);
        }
        if (uniqueByLower.size() > MAX_TAGS) {
            throw new BadRequestException("A task can have at most " + MAX_TAGS + " tags.");
        }
        return new ArrayList<>(uniqueByLower.values());
    }

    static String normalizeReminder(String reminder) {
        if (reminder == null || reminder.isBlank() || "none".equalsIgnoreCase(reminder.trim())) {
            return null;
        }
        String value = reminder.trim().toLowerCase(Locale.ROOT);
        if (!REMINDER_VALUES.contains(value)) {
            throw new BadRequestException("Invalid reminder option.");
        }
        return value;
    }

    static String normalizeRecurrence(String recurrence) {
        if (recurrence == null || recurrence.isBlank() || "none".equalsIgnoreCase(recurrence.trim())) {
            return null;
        }
        String value = recurrence.trim().toLowerCase(Locale.ROOT);
        if (!RECURRENCE_VALUES.contains(value)) {
            throw new BadRequestException("Invalid recurrence option.");
        }
        return value;
    }
}
