package com.it3030.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AppUserRepository appUserRepository;
    private final OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
    private final Set<String> adminEmails;

    public CustomOAuth2UserService(AppUserRepository appUserRepository,
                                   @Value("${app.security.admin-emails:}") String adminEmailsProperty) {
        this.appUserRepository = appUserRepository;
        this.adminEmails = Arrays.stream(adminEmailsProperty.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(value -> value.toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = delegate.loadUser(userRequest);
        System.out.println("OAuth2 User Attributes: " + oauth2User.getAttributes());

        String googleSub = oauth2User.getAttribute("sub");
        String email = oauth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            email = oauth2User.getAttribute("preferred_username");
        }
        String name = oauth2User.getAttribute("name");

        if (googleSub == null || googleSub.isBlank()) {
            throw new OAuth2AuthenticationException("Missing Google subject (sub) in OAuth2 profile.");
        }

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Missing email in OAuth2 profile.");
        }

        String normalizedEmail = email.toLowerCase(Locale.ROOT);
        AppUser.AppUserRole mappedRole = adminEmails.contains(normalizedEmail)
            ? AppUser.AppUserRole.ADMIN
            : AppUser.AppUserRole.USER;

        AppUser appUser = appUserRepository.findByGoogleSub(googleSub)
            .orElseGet(() -> appUserRepository.findByEmail(normalizedEmail).orElseGet(AppUser::new));

        appUser.setGoogleSub(googleSub);
        appUser.setEmail(normalizedEmail);
        appUser.setFullName(name == null || name.isBlank() ? normalizedEmail : name);
        appUser.setRole(mappedRole);

        AppUser saved = appUserRepository.save(appUser);

        Map<String, Object> mappedAttributes = new HashMap<>(oauth2User.getAttributes());
        mappedAttributes.put("appUserId", saved.getId());
        mappedAttributes.put("appRole", saved.getRole().name());
        mappedAttributes.put("appEmail", saved.getEmail());
        mappedAttributes.put("appName", saved.getFullName());

        return new DefaultOAuth2User(
            Set.of(new SimpleGrantedAuthority("ROLE_" + saved.getRole().name())),
            mappedAttributes,
            "appUserId"
        );
    }
}
