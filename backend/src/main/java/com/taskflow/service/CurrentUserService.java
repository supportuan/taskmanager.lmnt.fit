package com.taskflow.service;

import com.taskflow.entity.User;
import com.taskflow.exception.ResourceNotFoundException;
import com.taskflow.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public User requireUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResourceNotFoundException("User not found.");
        }
        return userRepository
                .findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }
}
