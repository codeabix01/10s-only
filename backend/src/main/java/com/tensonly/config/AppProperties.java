package com.tensonly.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application configuration properties bound from the "app" prefix in application.yml.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Razorpay razorpay,
        Otp otp,
        Auth auth
) {

    public record Jwt(
            String secret,
            long expirationMs
    ) {
    }

    public record Razorpay(
            String keyId,
            String keySecret,
            double platformFeePercent,
            double gstPercent
    ) {
    }

    public record Otp(
            String provider
    ) {
    }

    public record Auth(
            java.util.List<String> adminEmails
    ) {
    }
}
