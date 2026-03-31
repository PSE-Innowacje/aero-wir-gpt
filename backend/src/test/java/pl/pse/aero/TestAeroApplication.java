package pl.pse.aero;

import org.springframework.boot.SpringApplication;

public class TestAeroApplication {

    public static void main(String[] args) {
        SpringApplication.from(AeroApplication::main)
                .with(TestcontainersConfig.class)
                .run(args);
    }
}
