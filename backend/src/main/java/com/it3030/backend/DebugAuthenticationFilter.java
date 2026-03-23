package com.it3030.backend;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class DebugAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        
        if (path.startsWith("/api/")) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            
            System.out.println("\n=== DEBUG AUTH ===");
            System.out.println("Path: " + path);
            System.out.println("Authentication: " + (auth != null ? "EXISTS" : "NULL"));
            
            if (auth != null) {
                System.out.println("  Principal: " + auth.getPrincipal().getClass().getSimpleName());
                System.out.println("  Name: " + auth.getName());
                System.out.println("  Authenticated: " + auth.isAuthenticated());
                System.out.println("  Authorities: " + auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .toList());
                
                if (auth.getPrincipal() instanceof org.springframework.security.oauth2.core.user.OAuth2User oauth2) {
                    System.out.println("  OAuth2 Attributes: " + oauth2.getAttributes().keySet());
                }
            }
            System.out.println("==================\n");
        }
        
        filterChain.doFilter(request, response);
    }
}
