package com.it3030.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final AppUserRepository appUserRepository;
    private final Set<String> adminEmails;

    public CustomOidcUserService(AppUserRepository appUserRepository,
                                   @Value("${app.security.admin-emails:}") String adminEmailsProperty) {
        this.appUserRepository = appUserRepository;
        this.adminEmails = Arrays.stream(adminEmailsProperty.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .map(value -> value.toLowerCase(Locale.ROOT))
            .collect(Collectors.toSet());
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        System.out.println("OIDC User Attributes: " + oidcUser.getAttributes());

        String googleSub = oidcUser.getAttribute("sub");
        String email = oidcUser.getAttribute("email");
        if (email == null || email.isBlank()) {
            email = oidcUser.getAttribute("preferred_username");
        }
        String name = oidcUser.getAttribute("name");

        if (googleSub == null || googleSub.isBlank()) {
            throw new OAuth2AuthenticationException("Missing Google subject (sub) in OIDC profile.");
        }

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Missing email in OIDC profile.");
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

        Map<String, Object> mappedClaims = new HashMap<>();
        if (oidcUser.getUserInfo() != null) {
            mappedClaims.putAll(oidcUser.getUserInfo().getClaims());
        }
        // Also map from idToken if userInfo was empty or we want to ensure we have all attributes
        // But usually we just want to ADD our own.
        // Note: DefaultOidcUser merges IdToken and UserInfo. If we pass a new UserInfo, it merges that.
        
        mappedClaims.put("appUserId", saved.getId());
        mappedClaims.put("appRole", saved.getRole().name());
        mappedClaims.put("appEmail", saved.getEmail());
        mappedClaims.put("appName", saved.getFullName());
        
        OidcUserInfo userInfo = new OidcUserInfo(mappedClaims);

        return new DefaultOidcUser(
            Set.of(new SimpleGrantedAuthority("ROLE_" + saved.getRole().name())),
            oidcUser.getIdToken(),
            userInfo
        );
    }
}