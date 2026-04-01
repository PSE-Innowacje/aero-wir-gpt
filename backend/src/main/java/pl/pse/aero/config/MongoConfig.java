package pl.pse.aero.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Sort;

/**
 * MongoDB configuration: enables auditing and ensures unique indexes.
 *
 * Unique constraints enforced at the database level:
 *   - User.email
 *   - Helicopter.registrationNumber
 *   - CrewMember.email
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    CommandLineRunner ensureIndexes(MongoTemplate mongoTemplate) {
        return args -> {
            mongoTemplate.indexOps("user").ensureIndex(
                    new Index().on("email", Sort.Direction.ASC).unique());

            mongoTemplate.indexOps("helicopter").ensureIndex(
                    new Index().on("registrationNumber", Sort.Direction.ASC).unique());

            mongoTemplate.indexOps("crew_member").ensureIndex(
                    new Index().on("email", Sort.Direction.ASC).unique());

            mongoTemplate.indexOps("flight_operation").ensureIndex(
                    new Index().on("status", Sort.Direction.ASC));

            mongoTemplate.indexOps("flight_order").ensureIndex(
                    new Index().on("status", Sort.Direction.ASC));
        };
    }
}
