package com.gigshield.config;

import com.gigshield.model.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static AuthUserDetails currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthUserDetails u)) {
            return null;
        }
        return u;
    }

    public static void requireWorkerOrAdmin(Long userId) {
        AuthUserDetails u = currentUser();
        if (u == null) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        if (u.getRole() == Role.ADMIN) {
            return;
        }
        if (!u.getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Forbidden");
        }
    }

    public static void requireAdmin() {
        AuthUserDetails u = currentUser();
        if (u == null || u.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Admin only");
        }
    }
}
