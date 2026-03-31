# 2-SC-AERO: Backend Spring Boot setup

**Phase**: 0 — Scaffolding
**Depends on**: 1-SC-AERO
**Ref**: implementation-plan.md § 0.2, § 0.4

## Description
Create the backend Gradle build file with Spring Boot 3.4.x plugin, Java 21 toolchain, and all required dependencies. Add the Spring Boot main application class and the application configuration YAML with Couchbase connection settings, server port, and file upload limits.

## Acceptance Criteria
- [ ] `backend/build.gradle.kts` exists with Spring Boot 3.4.x plugin and Java 21 toolchain
- [ ] Dependencies include: spring-boot-starter-web, spring-boot-starter-data-couchbase, spring-boot-starter-security, spring-boot-starter-validation, lombok (compileOnly + annotationProcessor)
- [ ] `AeroApplication.java` exists with `@SpringBootApplication` and standard main method
- [ ] `application.yml` configures Couchbase connection (couchbase://localhost, user: aero, pw: aeropass), bucket: aero, auto-index: true, server port 8080, upload dir `./uploads/kml`, multipart max-file-size 10MB
- [ ] `./gradlew :backend:compileJava` succeeds
- [ ] `./gradlew :backend:bootRun` starts (will fail on Couchbase connection if DB not up — that is expected)

## Files to Create/Modify
- backend/build.gradle.kts
- backend/src/main/java/pl/pse/aero/AeroApplication.java
- backend/src/main/resources/application.yml
