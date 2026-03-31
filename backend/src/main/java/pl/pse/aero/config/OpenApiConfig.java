package pl.pse.aero.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI aeroOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AERO API")
                        .description("Helicopter flight operations management system")
                        .version("1.0.0"));
    }
}
