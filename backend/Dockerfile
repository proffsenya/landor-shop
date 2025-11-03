FROM openjdk:17-slim

WORKDIR /app

# Копируем Gradle файлы
COPY build.gradle .
COPY gradlew .
COPY gradle/ gradle/

# Копируем исходный код
COPY src/ src/

# Даем права на выполнение gradlew
RUN chmod +x ./gradlew

# Собираем приложение
RUN ./gradlew build -x test

# Запускаем приложение
ENTRYPOINT ["java", "-jar", "build/libs/*.jar"]