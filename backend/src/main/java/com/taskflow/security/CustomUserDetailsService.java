package com.taskflow.security;

import com.taskflow.entity.UserStatus;
import com.taskflow.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.taskflow.entity.User user = userRepository
                .findByEmailIgnoreCase(username.trim())
                .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password."));

        String roleName = user.getRole() != null ? user.getRole().name() : "USER";
        boolean enabled = user.getStatus() == null || user.getStatus() == UserStatus.ACTIVE;

        return User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(roleName)
                .disabled(!enabled)
                .build();
    }
}
