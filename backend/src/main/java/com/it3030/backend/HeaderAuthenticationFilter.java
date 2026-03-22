package com.it3030.backend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    private static final String USER_ID_HEADER = "X-User-Id";
    private static final String ROLE_HEADER = "X-User-Role";
    private static final Set<String> ALLOWED_ROLES = Set.of("USER", "ADMIN", "TECHNICIAN");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String userIdHeader = request.getHeader(USER_ID_HEADER);
        String roleHeader = request.getHeader(ROLE_HEADER);

        if (userIdHeader != null && roleHeader != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            String normalizedRole = roleHeader.trim().toUpperCase(Locale.ROOT);
            if (ALLOWED_ROLES.contains(normalizedRole)) {
                try {
                    Long.parseLong(userIdHeader.trim());
                    UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                            userIdHeader.trim(),
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole))
                        );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (NumberFormatException ignored) {
                    SecurityContextHolder.clearContext();
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
