# 2-SC-AERO: Backend Spring Boot setup

**Phase**: 0 — Scaffolding
**Depends on**: 1-SC-AERO
**Ref**: implementation-plan.md § 0.2, § 0.4

## Description
Create the backend Gradle build file with Spring Boot 3.4.x plugin, Java 21 toolchain, and all required dependencies. Add the Spring Boot main application class and the application configuration YAML with PostgreSQL datasource settings, JPA configuration, server port, and file upload limits.

## Acceptance Criteria
- [ ] `backend/build.gradle.kts` exists with Spring Boot 3.4.x plugin and Java 21 toolchain
- [ ] Dependencies include: spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-security, spring-boot-starter-validation, postgresql (runtimeOnly), lombok (compileOnly + annotationProcessor)
- [ ] `AeroApplication.java` exists with `@SpringBootApplication` and standard main method
- [ ] `application.yml` configures datasource (jdbc:postgresql://localhost:5432/aero, user: aero, pw: aero), JPA ddl-auto: update, show-sql: false, server port 8080, upload dir `./uploads/kml`, multipart max-file-size 10MB
- [ ] `./gradlew :backend:compileJava` succeeds
- [ ] `./gradlew :backend:bootRun` starts (will fail on Postgres connection if DB not up — that is expected)

## Files to Create/Modify
- backend/build.gradle.kts
- backend/src/main/java/com/nullterrier/aero/AeroApplication.java
- backend/src/main/resources/application.yml
