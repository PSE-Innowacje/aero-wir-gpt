# syntax=docker/dockerfile:1.7

# =========================================================================
# Stage 1 — Build the React frontend
# =========================================================================
FROM node:20-alpine AS frontend-build
WORKDIR /fe

# Install deps first for better layer caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Build the SPA → /fe/dist
COPY frontend/ ./
RUN npm run build

# =========================================================================
# Stage 2 — Build the Spring Boot JAR (with SPA bundled into static/)
# =========================================================================
FROM eclipse-temurin:21-jdk AS backend-build
WORKDIR /be

# Gradle wrapper + root-level build files (for :backend subproject)
COPY gradlew gradlew.bat ./
COPY gradle/ gradle/
COPY settings.gradle.kts build.gradle.kts ./
RUN chmod +x gradlew

# Backend source
COPY backend/ backend/

# Bundle the built SPA into Spring Boot's classpath:/static so the JAR
# serves the frontend directly (same origin → no CORS, sessions just work)
COPY --from=frontend-build /fe/dist/ backend/src/main/resources/static/

# Build the fat JAR. Skip tests — they need Testcontainers (Docker-in-Docker).
RUN ./gradlew :backend:bootJar -x test --no-daemon

# =========================================================================
# Stage 3 — Lean runtime image (JRE only, no build tools)
# =========================================================================
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Copy the built jar. We don't care about the version suffix in the filename.
COPY --from=backend-build /be/backend/build/libs/*.jar app.jar

# Render's free tier has 512 MB RAM. Cap heap at 70% so Tomcat + off-heap fits.
# SerialGC uses less memory than G1 on tiny heaps.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=70.0 -XX:+UseSerialGC"

# Render injects PORT — application.yml reads ${PORT:8080}.
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
