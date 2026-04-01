package pl.pse.aero;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.MongoDBContainer;

@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    private static final Logger log = LoggerFactory.getLogger(TestcontainersConfig.class);

    @Bean
    @ServiceConnection
    public MongoDBContainer mongoDBContainer() {
        MongoDBContainer container = new MongoDBContainer("mongo:7");
        container.start();
        log.info(">>> MongoDB test container: {}",
                container.getReplicaSetUrl());
        return container;
    }
}
