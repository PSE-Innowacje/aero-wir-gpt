package pl.pse.aero.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA (React Router) fallback.
 *
 * When the SPA is bundled into the backend JAR (src/main/resources/static/),
 * Spring serves index.html at "/" automatically. But deep links like
 * /operations or /operations/123 would otherwise 404 on a hard refresh —
 * Spring does not know about React Router's client-side routes.
 *
 * This controller forwards all known SPA top-level routes (and their sub-paths)
 * to /index.html, which loads the SPA; React Router then takes over and renders
 * the correct view. REST controllers under /api/** are not affected because
 * more specific @RequestMapping annotations win over these generic patterns.
 */
@Controller
public class SpaFallbackController {

    @RequestMapping(value = {
            "/",
            "/login",
            "/dashboard",
            "/helicopters", "/helicopters/**",
            "/crew", "/crew/**",
            "/landing-sites", "/landing-sites/**",
            "/users", "/users/**",
            "/operations", "/operations/**",
            "/orders", "/orders/**"
    })
    public String forwardToSpa() {
        return "forward:/index.html";
    }
}
