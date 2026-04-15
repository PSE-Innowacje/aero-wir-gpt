package pl.pse.aero.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import pl.pse.aero.security.CustomAccessDeniedHandler;
import pl.pse.aero.security.CustomAuthenticationEntryPoint;

import org.springframework.context.annotation.Profile;

import java.util.List;

@Configuration
@EnableWebSecurity
@Profile("!noauth")
public class SecurityConfig {

    private final CustomAuthenticationEntryPoint authenticationEntryPoint;
    private final CustomAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(CustomAuthenticationEntryPoint authenticationEntryPoint,
                          CustomAccessDeniedHandler accessDeniedHandler) {
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/dictionaries/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // SPA static assets and routes served from classpath:/static (bundled into jar).
                        // Authentication is still enforced for /api/** endpoints by the rules below;
                        // the frontend calls /api/auth/me on load and redirects to /login when it gets 401.
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/assets/**",
                                "/login", "/dashboard",
                                "/helicopters/**", "/crew/**", "/landing-sites/**",
                                "/users/**", "/operations/**", "/orders/**",
                                "/*.js", "/*.css", "/*.svg", "/*.png", "/*.ico", "/*.json",
                                "/*.woff", "/*.woff2", "/*.ttf").permitAll()
                        // Admin CRUD: SUPERUSER/ADMIN full access, SUPERVISOR/PILOT read-only, PLANNER denied
                        .requestMatchers(HttpMethod.GET, "/api/helicopters/**", "/api/crew-members/**",
                                "/api/landing-sites/**", "/api/users/**")
                            .hasAnyRole("SUPERUSER", "ADMIN", "SUPERVISOR", "PILOT")
                        .requestMatchers(HttpMethod.POST, "/api/helicopters/**", "/api/crew-members/**",
                                "/api/landing-sites/**", "/api/users/**")
                            .hasAnyRole("SUPERUSER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/helicopters/**", "/api/crew-members/**",
                                "/api/landing-sites/**", "/api/users/**")
                            .hasAnyRole("SUPERUSER", "ADMIN")
                        // Operations: SUPERUSER/PLANNER/SUPERVISOR full access, ADMIN/PILOT read-only
                        .requestMatchers(HttpMethod.GET, "/api/operations/**")
                            .hasAnyRole("SUPERUSER", "ADMIN", "PLANNER", "SUPERVISOR", "PILOT")
                        .requestMatchers(HttpMethod.POST, "/api/operations/**")
                            .hasAnyRole("SUPERUSER", "PLANNER", "SUPERVISOR")
                        .requestMatchers(HttpMethod.PUT, "/api/operations/**")
                            .hasAnyRole("SUPERUSER", "PLANNER", "SUPERVISOR")
                        // Orders: SUPERUSER/PILOT full, SUPERVISOR read+edit+status, ADMIN read-only, PLANNER denied
                        .requestMatchers(HttpMethod.GET, "/api/orders/**")
                            .hasAnyRole("SUPERUSER", "ADMIN", "SUPERVISOR", "PILOT")
                        .requestMatchers(HttpMethod.POST, "/api/orders")
                            .hasAnyRole("SUPERUSER", "PILOT")
                        .requestMatchers(HttpMethod.PUT, "/api/orders/**")
                            .hasAnyRole("SUPERUSER", "PILOT", "SUPERVISOR")
                        .requestMatchers(HttpMethod.POST, "/api/orders/*/status")
                            .hasAnyRole("SUPERUSER", "PILOT", "SUPERVISOR")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler)
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*"));
        config.setAllowedMethods(List.of(
                HttpMethod.GET.name(),
                HttpMethod.POST.name(),
                HttpMethod.PUT.name(),
                HttpMethod.DELETE.name()
        ));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
