package com.taskflow.config;

import com.taskflow.entity.User;
import com.taskflow.entity.UserRole;
import com.taskflow.repository.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures designated Super Admin emails have SUPER_ADMIN role after startup.
 * Does not create accounts or store passwords — register accounts through normal signup first.
 */
@Component
public class SuperAdminRoleInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminRoleInitializer.class);

    private static final List<String> SUPER_ADMIN_EMAILS = List.of(
            "sandeep@applyuninow.com",
            "srihari@lmnt.fit",
            "srinivastarun2002@gmail.com");

    private final UserRepository userRepository;

    public SuperAdminRoleInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (String email : SUPER_ADMIN_EMAILS) {
            userRepository.findByEmailIgnoreCase(email.trim()).ifPresentOrElse(
                    this::promoteIfNeeded,
                    () -> log.info(
                            "Super Admin email not registered yet (no account created): {}",
                            email));
        }
    }

    private void promoteIfNeeded(User user) {
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            return;
        }
        user.setRole(UserRole.SUPER_ADMIN);
        userRepository.save(user);
        log.info("Assigned SUPER_ADMIN role to existing user id={}", user.getId());
    }
}
