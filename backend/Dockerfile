FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/gigshield-backend-1.0.0.jar ./
EXPOSE 8080
CMD ["java", "-jar", "gigshield-backend-1.0.0.jar"]
