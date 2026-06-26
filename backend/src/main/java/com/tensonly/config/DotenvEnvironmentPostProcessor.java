package com.tensonly.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.StandardEnvironment;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DotenvEnvironmentPostProcessor.class);
    private static final String PROPERTY_SOURCE_NAME = "dotenvProperties";
    private static final List<Path> CANDIDATE_PATHS = List.of(
            Path.of(".env"),
            Path.of("backend/.env"),
            Path.of("../.env")
    );

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path envFile = locateEnvFile();
        if (envFile == null) {
            log.info("No backend .env file found; skipping dotenv load.");
            return;
        }

        try {
            Map<String, Object> properties = new LinkedHashMap<>(parseDotenv(envFile));
            if (properties.isEmpty()) {
                log.info("Backend .env file {} contained no entries.", envFile);
                return;
            }

            MapPropertySource propertySource = new MapPropertySource(PROPERTY_SOURCE_NAME, properties);
            MutablePropertySources propertySources = environment.getPropertySources();
            if (propertySources.contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
                propertySources.addAfter(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME, propertySource);
            } else {
                propertySources.addFirst(propertySource);
            }
            log.info("Loaded backend .env file from {}.", envFile);
        } catch (IOException e) {
            log.warn("Unable to load backend .env file {}: {}", envFile, e.getMessage());
        }
    }

    private Path locateEnvFile() {
        for (Path candidate : CANDIDATE_PATHS) {
            if (Files.exists(candidate) && Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private Map<String, String> parseDotenv(Path envFile) throws IOException {
        Map<String, String> values = new LinkedHashMap<>();
        for (String rawLine : Files.readAllLines(envFile, StandardCharsets.UTF_8)) {
            String line = rawLine.trim();
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }
            int index = line.indexOf('=');
            if (index <= 0) {
                continue;
            }
            String key = line.substring(0, index).trim();
            String value = line.substring(index + 1).trim();
            if (value.length() >= 2) {
                if ((value.startsWith("\"") && value.endsWith("\"")) ||
                    (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
            }
            values.put(key, value);
        }
        return values;
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
