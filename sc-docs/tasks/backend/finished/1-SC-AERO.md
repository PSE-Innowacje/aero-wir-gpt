# 1-SC-AERO: Monorepo restructure

**Phase**: 0 — Scaffolding
**Depends on**: none
**Ref**: implementation-plan.md § 0.1

## Description
Restructure the project from a flat layout into a Gradle multi-project monorepo. Remove the existing root `src/` directory and create the `backend/` subdirectory tree with standard Maven/Gradle source layout. Update `settings.gradle.kts` to declare the root project name and include the `backend` subproject. Strip the root `build.gradle.kts` down to an allprojects configuration block containing only group and version — remove java plugin application and all dependency declarations.

## Acceptance Criteria
- [ ] Root `src/` directory no longer exists
- [ ] `backend/src/main/java/pl/pse/aero/` directory structure exists
- [ ] `backend/src/main/resources/` directory exists
- [ ] `backend/src/test/java/` directory exists
- [ ] `backend/src/test/resources/` directory exists
- [ ] `settings.gradle.kts` sets `rootProject.name = "auro"` and contains `include("backend")`
- [ ] Root `build.gradle.kts` contains only allprojects config (group + version), no java plugin or deps
- [ ] `./gradlew projects` shows `:backend` subproject

## Files to Create/Modify
- settings.gradle.kts
- build.gradle.kts
- backend/src/main/java/pl/pse/aero/.gitkeep
- backend/src/main/resources/.gitkeep
- backend/src/test/java/.gitkeep
- backend/src/test/resources/.gitkeep
