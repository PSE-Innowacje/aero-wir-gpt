package pl.pse.aero;

import com.couchbase.client.java.manager.collection.CollectionSpec;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.couchbase.BucketDefinition;
import org.testcontainers.couchbase.CouchbaseContainer;

@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfig {

    @Bean
    @ServiceConnection
    public CouchbaseContainer couchbaseContainer() {
        return new CouchbaseContainer("couchbase/server:7.6.1")
                .withBucket(new BucketDefinition("aero"));
    }
}
