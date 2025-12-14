# backend/Dockerfile
FROM gradle:7.6-jdk17 AS builder
WORKDIR /home/gradle/project

COPY --chown=gradle:gradle . .

RUN gradle clean bootJar --no-daemon -x test

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=builder /home/gradle/project/build/libs/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
