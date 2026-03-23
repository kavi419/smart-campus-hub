package com.it3030.backend;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final Set<String> adminEmails;

    public AuthController(AppUserRepository appUserRepository,
                          @Value("${app.security.admin-emails:}") String adminEmailsProperty) {
        this.appUserRepository = appUserRepository;
        this.adminEmails = Arrays.stream(adminEmailsProperty.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(value -> value.toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Object idAttribute = oauth2User.getAttribute("appUserId");
        if (idAttribute != null) {
            Long userId = Long.valueOf(idAttribute.toString());
            String email = oauth2User.getAttribute("appEmail");
            String name = oauth2User.getAttribute("appName");
            String role = oauth2User.getAttribute("appRole");
            return ResponseEntity.ok(new AuthUserResponse(userId, email, name, role));
        }

        String googleSub = oauth2User.getAttribute("sub");
        String email = oauth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            email = oauth2User.getAttribute("preferred_username");
        }
        String name = oauth2User.getAttribute("name");

        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        AppUser appUser = null;

        if (googleSub != null && !googleSub.isBlank()) {
            appUser = appUserRepository.findByGoogleSub(googleSub).orElse(null);
        }
        if (appUser == null && normalizedEmail != null && !normalizedEmail.isBlank()) {
            appUser = appUserRepository.findByEmail(normalizedEmail).orElse(null);
        }
        if (appUser == null) {
            appUser = new AppUser();
        }

        if (googleSub != null && !googleSub.isBlank()) {
            appUser.setGoogleSub(googleSub);
        }
        if (normalizedEmail != null && !normalizedEmail.isBlank()) {
            appUser.setEmail(normalizedEmail);
            appUser.setRole(adminEmails.contains(normalizedEmail) ? AppUser.AppUserRole.ADMIN : AppUser.AppUserRole.USER);
        } else if (appUser.getRole() == null) {
            appUser.setRole(AppUser.AppUserRole.USER);
        }
        appUser.setFullName(name == null || name.isBlank()
            ? (normalizedEmail == null ? "Unknown User" : normalizedEmail)
            : name);

        AppUser saved = appUserRepository.save(appUser);

        return ResponseEntity.ok(new AuthUserResponse(
            saved.getId(),
            saved.getEmail(),
            saved.getFullName(),
            saved.getRole().name()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       HttpServletResponse response,
                                       Authentication authentication) {
        new SecurityContextLogoutHandler().logout(request, response, authentication);
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
}
