package pl.pse.aero;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.couchbase.BucketDefinition;
import org.testcontainers.couchbase.CouchbaseContainer;

@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    private static final Logger log = LoggerFactory.getLogger(TestcontainersConfig.class);

    @Bean
    @ServiceConnection
    public CouchbaseContainer couchbaseContainer() {
        CouchbaseContainer container = new CouchbaseContainer("couchbase/server:7.6.1")
                .withCredentials("admin", "admin1")
                .withBucket(new BucketDefinition("aero"));
        container.start();
        log.info(">>> Couchbase Web Console: http://localhost:{} (admin / admin1)",
                container.getMappedPort(8091));
        return container;
    }
}
