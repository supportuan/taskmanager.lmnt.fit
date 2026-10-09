package com.taskflow.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.taskflow.dto.CreateTaskRequest;
import com.taskflow.entity.Task;
import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private User userA;
    private User userB;
    private Task taskA;

    @BeforeEach
    void setUp() {
        userA = new User();
        userA.setId(1L);
        userA.setEmail("a@test.com");
        userA.setName("User A");

        userB = new User();
        userB.setId(2L);
        userB.setEmail("b@test.com");
        userB.setName("User B");

        taskA = new Task();
        taskA.setId(10L);
        taskA.setUser(userA);
        taskA.setTitle("Task A");
        taskA.setTaskDate(LocalDate.of(2026, 10, 7));
    }

    @Test
    void getTask_returnsOwnedTask() {
        when(taskRepository.findByIdAndUser_Id(10L, 1L)).thenReturn(Optional.of(taskA));

        var response = taskService.getTask(userA, 10L);

        assertEquals("Task A", response.title());
    }

    @Test
    void getTask_otherUser_throwsNotFound() {
        when(taskRepository.findByIdAndUser_Id(10L, 2L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.getTask(userB, 10L));
    }

    @Test
    void createTask_assignsAuthenticatedUser() {
        when(userRepository.getReferenceById(1L)).thenReturn(userA);
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> {
            Task saved = inv.getArgument(0);
            saved.setId(99L);
            return saved;
        });

        var request = new CreateTaskRequest(
                "New task",
                null,
                LocalDate.of(2026, 10, 8),
                null,
                null,
                30,
                "HIGH",
                "Dev",
                "PENDING",
                0,
                null,
                null,
                null);

        var response = taskService.createTask(userA, request);

        assertEquals("New task", response.title());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void deleteTask_otherUser_doesNotDelete() {
        when(taskRepository.existsByIdAndUser_Id(10L, 2L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> taskService.deleteTask(userB, 10L));
        verify(taskRepository, never()).deleteByIdAndUser_Id(10L, 2L);
    }
}
