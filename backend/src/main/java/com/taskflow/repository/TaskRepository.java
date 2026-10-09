package com.taskflow.repository;

import com.taskflow.entity.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    @EntityGraph(attributePaths = {"tags"})
    List<Task> findAllByUser_IdOrderByTaskDateAscStartTimeAsc(Long userId);

    @EntityGraph(attributePaths = {"tags"})
    Page<Task> findAllByUser_IdOrderByUpdatedAtDescIdDesc(Long userId, Pageable pageable);

    long countByUser_Id(Long userId);

    @EntityGraph(attributePaths = {"tags"})
    Optional<Task> findByIdAndUser_Id(Long id, Long userId);

    boolean existsByIdAndUser_Id(Long id, Long userId);

    void deleteByIdAndUser_Id(Long id, Long userId);
}
